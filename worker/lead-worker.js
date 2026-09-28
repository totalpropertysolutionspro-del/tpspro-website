// TPS Pro — lead-worker.js
// A Cloudflare Worker on YOUR account that receives quote-form submissions and
// emails them straight to you. No third-party form or email service ever holds
// a lead: delivery uses Cloudflare Email Routing's send_email binding, which
// can mail any *verified* Email Routing destination (crcp183@gmail.com already
// is — it's where bookings@totalpropertysolution.net forwards).
//
// Setup (dashboard, no CLI needed): Workers & Pages → Create → Worker "tps-lead"
// → paste this file → Settings → Bindings → Add "Send email" binding named
// LEAD_MAIL with destination crcp183@gmail.com. Vars (Settings → Variables):
//   LEAD_TO       — crcp183@gmail.com (must be a verified Email Routing destination)
//   LEAD_FROM     — leads@totalpropertysolution.net (any address on the routed domain)
//   ALLOW_ORIGIN  — https://totalpropertysolution.net
// Then set LEAD_ENDPOINT in assets/fresh.js to the Worker URL.

import { EmailMessage } from 'cloudflare:email';

const MAX_FIELDS = 20;
const MAX_LEN = 4000;

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const b64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/.{76}/g, '$&\r\n');
};

// RFC 2047 so em dashes and accents survive in the subject line.
const encodeHeader = (s) => `=?UTF-8?B?${b64(s).replace(/\r\n/g, '')}?=`;

const cleanHeader = (s) => String(s || '').replace(/[\r\n]+/g, ' ').trim();

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOW_ORIGIN || 'https://totalpropertysolution.net').split(',').map((s) => s.trim());
    const reqOrigin = request.headers.get('Origin') || '';
    const origin = allowed.includes(reqOrigin) ? reqOrigin : allowed[0];
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405, cors);
    if (reqOrigin && !allowed.includes(reqOrigin)) return json({ error: 'origin not allowed' }, 403, cors);

    let data;
    try { data = await request.json(); } catch { return json({ error: 'bad json' }, 400, cors); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) return json({ error: 'bad payload' }, 400, cors);

    // Honeypot: bots fill hidden fields; drop silently with a 200 so they don't retry.
    if (data._gotcha || data.website) return json({ ok: true }, 200, cors);

    const keys = Object.keys(data).filter((k) => k !== 'subject' && k !== 'page' && k[0] !== '_' && data[k]);
    if (keys.length === 0 || keys.length > MAX_FIELDS) return json({ error: 'bad fields' }, 400, cors);
    const val = (k) => String(data[k]).slice(0, MAX_LEN);
    if (!keys.some((k) => /phone|email|tel/i.test(k))) return json({ error: 'contact required' }, 400, cors);

    const subject = cleanHeader(data.subject || 'New lead — totalpropertysolution.net').slice(0, 160);
    const label = (k) => k.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const rows = keys.map((k) =>
      `<tr><td style="padding:8px 12px;font-weight:700;vertical-align:top;border-bottom:1px solid #E2E7DB">${esc(label(k))}</td>` +
      `<td style="padding:8px 12px;border-bottom:1px solid #E2E7DB;white-space:pre-wrap">${esc(val(k))}</td></tr>`).join('');
    const html = `<div style="font-family:system-ui,Arial,sans-serif;max-width:600px">
<h2 style="color:#0E3A19;margin:0 0 4px">New lead from totalpropertysolution.net</h2>
<p style="color:#47584B;margin:0 0 14px">${esc(subject)}</p>
<table style="border-collapse:collapse;width:100%;border:1px solid #E2E7DB">${rows}</table>
<p style="color:#7C8A7F;font-size:12px;margin-top:14px">Page: ${esc(String(data.page || '').slice(0, 300))}</p>
</div>`;

    const replyTo = keys.find((k) => /email/i.test(k) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val(k)));
    const from = env.LEAD_FROM || 'leads@totalpropertysolution.net';
    const to = env.LEAD_TO || 'crcp183@gmail.com';
    const domain = from.split('@')[1];

    const raw = [
      `From: TPS Pro Website <${from}>`,
      `To: ${to}`,
      replyTo ? `Reply-To: ${cleanHeader(val(replyTo))}` : null,
      `Subject: ${encodeHeader(subject)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@${domain}>`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(html),
    ].filter((l) => l !== null).join('\r\n');

    try {
      await env.LEAD_MAIL.send(new EmailMessage(from, to, raw));
    } catch (e) {
      return json({ error: 'send failed', detail: String(e && e.message || e).slice(0, 200) }, 502, cors);
    }
    return json({ ok: true }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
