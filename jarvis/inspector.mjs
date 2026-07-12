#!/usr/bin/env node
// jarvis/inspector.mjs — JARVIS Crew: the Inspector
//
// Weekly deep audit of every page in this repo, merged with the Scout's
// competitor intel (fetched cross-repo from jarvis-app). Produces:
//   jarvis/report.md   — the crew's weekly standup (also posted as a GitHub Issue)
//   jarvis/tasks.json  — the shared task ledger, scored and owner-assigned
//
// Read-only over the site: the Inspector NEVER edits pages. It routes work —
// meta drift belongs to the Fixer (seo-autopilot), copy tasks belong to Miguel.

import { readFile, writeFile, readdir, stat, mkdir } from 'node:fs/promises';

const SCOUT_INTEL_RAW =
  'https://raw.githubusercontent.com/Medina-Digital-A-i/jarvis-app/main/competitor-intel/snapshot.json';

const unesc = (s) => s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"');
const get = (html, rx) => { const m = html.match(rx); return m ? unesc(m[1].replace(/\s+/g, ' ').trim()) : null; };

async function auditPages() {
  const pages = (await readdir('.')).filter((f) => f.endsWith('.html'));
  const findings = [];
  const wordCounts = {};
  const allFiles = new Set(await readdir('.'));
  const imgFiles = new Set();
  try { for (const f of await readdir('images')) imgFiles.add(`images/${f}`); } catch {}
  try { for (const f of await readdir('images/work')) imgFiles.add(`images/work/${f}`); } catch {}
  try { for (const f of await readdir('assets')) imgFiles.add(`assets/${f}`); } catch {}

  const linkedInternally = new Set(['index.html']);

  for (const p of pages) {
    const html = await readFile(p, 'utf8');
    const noindex = /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html);

    // meta bands (must mirror the Fixer's patched rules: title 30-65, desc 100-170)
    const title = get(html, /<title[^>]*>([^<]*)<\/title>/i);
    const dm = html.match(/<meta[^>]+name=["']description["'][^>]+content=("|')([\s\S]*?)\1/i);
    const desc = dm ? unesc(dm[2].replace(/\s+/g, ' ').trim()) : null;
    if (!title) findings.push({ page: p, sev: 'high', type: 'meta', owner: 'fixer', detail: 'missing <title>' });
    else if (title.length < 30 || title.length > 65)
      findings.push({ page: p, sev: 'med', type: 'meta', owner: 'fixer', detail: `title ${title.length} chars (band 30-65)` });
    if (!desc && !noindex) findings.push({ page: p, sev: 'high', type: 'meta', owner: 'fixer', detail: 'missing meta description' });
    else if (desc && (desc.length < 100 || desc.length > 170) && !noindex)
      findings.push({ page: p, sev: 'med', type: 'meta', owner: 'fixer', detail: `description ${desc.length} chars (band 100-170)` });

    // essentials
    if (!/G-0KM9JRJL2D/.test(html)) findings.push({ page: p, sev: 'high', type: 'analytics', owner: 'fixer', detail: 'GA tag missing' });
    if (!/application\/ld\+json/.test(html) && !noindex)
      findings.push({ page: p, sev: 'med', type: 'schema', owner: 'fixer', detail: 'no JSON-LD schema' });
    if (!/assets\/fresh\.css/.test(html))
      findings.push({ page: p, sev: 'high', type: 'design', owner: 'human', detail: 'not on the design system' });

    // internal links + images
    for (const m of html.matchAll(/(?:href|src)="([^"#?]+?)"/g)) {
      let u = m[1];
      if (/^(https?:|mailto:|tel:|\/\/|data:)/.test(u)) continue;
      if (u.startsWith('/')) u = u.slice(1);
      if (!u) continue;
      if (u.endsWith('.html')) linkedInternally.add(u);
      const exists = allFiles.has(u) || imgFiles.has(u) ||
        (await stat(u).then(() => true).catch(() => false));
      if (!exists) findings.push({ page: p, sev: 'high', type: 'broken-link', owner: 'human', detail: `broken ref: ${u}` });
    }
    for (const m of html.matchAll(/background-image:\s*url\('([^']+)'\)/g)) {
      const ok = await stat(m[1]).then(() => true).catch(() => false);
      if (!ok) findings.push({ page: p, sev: 'high', type: 'broken-link', owner: 'human', detail: `broken bg image: ${m[1]}` });
    }

    // images without alt (accessibility + image SEO)
    const noAlt = [...html.matchAll(/<img(?![^>]*\balt=)[^>]*>/gi)].length;
    if (noAlt) findings.push({ page: p, sev: 'low', type: 'img-alt', owner: 'human', detail: `${noAlt} <img> without alt` });

    // content depth
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
    wordCounts[p] = text.split(/\s+/).filter(Boolean).length;
  }

  // orphan pages (not linked from any other page)
  for (const p of pages) {
    if (!linkedInternally.has(p) && !/^thank-you|-lp\.html$/.test(p))
      findings.push({ page: p, sev: 'med', type: 'orphan', owner: 'human', detail: 'no internal links point here' });
  }

  // oversized images actually referenced
  for (const f of imgFiles) {
    try {
      const s = await stat(f);
      if (s.size > 350 * 1024 && /\.(jpe?g|png)$/i.test(f))
        findings.push({ page: f, sev: 'med', type: 'img-weight', owner: 'human', detail: `${Math.round(s.size / 1024)}KB — compress to <300KB` });
    } catch {}
  }

  return { findings, wordCounts, pageCount: pages.length };
}

async function scoutIntel() {
  try {
    const res = await fetch(SCOUT_INTEL_RAW, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function contentDepthTasks(wordCounts, intel) {
  const tasks = [];
  if (!intel?.pages) return tasks;
  const field = Object.values(intel.pages).filter((r) => !r.id?.startsWith('tps-') && r.ok && r.wordCount);
  if (!field.length) return tasks;
  const fieldAvg = Math.round(field.reduce((a, r) => a + r.wordCount, 0) / field.length);
  const money = ['index.html', 'student-turnover-cleaning.html', 'commercial-cleaning-albany-ny.html',
    'post-construction-cleaning.html', 'property-management.html', 'renovations-construction.html'];
  for (const p of money) {
    const wc = wordCounts[p] || 0;
    if (wc < fieldAvg * 0.7)
      tasks.push({ page: p, sev: 'med', type: 'content-depth', owner: 'content',
        detail: `~${wc} words vs field avg ~${fieldAvg} — deepen with scope details, FAQs, local specifics` });
  }
  // encroachment straight from the Scout
  const threats = field.filter((r) => (r.keywordHits || []).some((k) => k.startsWith('student')));
  for (const t of threats)
    tasks.push({ page: 'student-turnover-cleaning.html', sev: 'high', type: 'encroachment', owner: 'human',
      detail: `Scout: ${t.name} now uses student-turn keywords (${t.url}) — review and respond` });
  return tasks;
}

const SEV_ORDER = { high: 0, med: 1, low: 2 };

async function main() {
  const { findings, wordCounts, pageCount } = await auditPages();
  const intel = await scoutIntel();
  findings.push(...contentDepthTasks(wordCounts, intel));
  findings.sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]);

  const now = new Date().toISOString();
  await mkdir('jarvis', { recursive: true });
  await writeFile('jarvis/tasks.json', JSON.stringify({ generatedAt: now, tasks: findings }, null, 2));

  const bySev = (s) => findings.filter((f) => f.sev === s);
  const lines = [];
  lines.push(`# JARVIS Crew — weekly inspection ${now.slice(0, 10)}`);
  lines.push('');
  lines.push(`Pages audited: **${pageCount}** · findings: **${findings.length}** (${bySev('high').length} high / ${bySev('med').length} med / ${bySev('low').length} low)`);
  lines.push(`Scout intel: ${intel ? `merged (snapshot ${intel.generatedAt?.slice(0, 10) ?? '?'})` : 'unavailable this run'}`);
  lines.push('');
  if (!findings.length) {
    lines.push('✅ **Clean sweep — no findings. The site is holding the line.**');
  } else {
    for (const sev of ['high', 'med', 'low']) {
      const fs = bySev(sev);
      if (!fs.length) continue;
      lines.push(`## ${sev.toUpperCase()} (${fs.length})`);
      for (const f of fs) lines.push(`- \`${f.page}\` **${f.type}** → _${f.owner}_ — ${f.detail}`);
      lines.push('');
    }
    lines.push('**Owners:** `fixer` = seo-autopilot handles on its next 6-hour run · `content`/`human` = needs Miguel or a drafted PR.');
  }
  lines.push('');
  lines.push('_Inspector is read-only; it routes work but never edits pages._');
  await writeFile('jarvis/report.md', lines.join('\n'));
  console.log(`inspector: ${pageCount} pages, ${findings.length} findings (${bySev('high').length} high)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
