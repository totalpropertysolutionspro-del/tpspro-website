#!/usr/bin/env node
// jarvis/season-rotator.mjs — JARVIS Crew: the Rotator
//
// The crew's hands: makes a real, safe, deterministic change to the live site.
// Rotates the homepage seasonal strip with the Albany services calendar so the
// site always sells what the market is buying this month. Runs monthly.
// Edits ONLY the block between the season markers in index.html.

import { readFile, writeFile } from 'node:fs/promises';

const SEASONS = [
  { months: [5, 6, 7, 8], // May–Aug: turn season
    html: `  <b>Turn season is here.</b> We turn 200+ student units every summer — <a href="student-turnover-cleaning.html">reserve your August turn window now</a>` },
  { months: [9, 10, 11], // Sep–Nov: fall projects
    html: `  <b>Renovation season.</b> Book fall buildouts &amp; post-construction cleans before the holidays — <a href="renovations-construction.html">start your project</a>` },
  { months: [12, 1, 2], // Dec–Feb: winter contracts
    html: `  <b>Winter-ready.</b> 24/7 emergency maintenance &amp; commercial cleaning contracts for the new year — <a href="commercial-cleaning-albany-ny.html">lock in your contract</a>` },
  { months: [3, 4], // Mar–Apr: spring make-ready
    html: `  <b>Spring make-ready season.</b> Get units inspection-ready before summer leases — <a href="make-ready-cleaning.html">book your make-readies</a>` },
];

const START = '<!-- jarvis:season:start -->';
const END = '<!-- jarvis:season:end -->';

async function main() {
  const month = new Date().getUTCMonth() + 1;
  const season = SEASONS.find((s) => s.months.includes(month));
  const src = await readFile('index.html', 'utf8');
  const i = src.indexOf(START), j = src.indexOf(END);
  if (i === -1 || j === -1 || j < i) {
    console.error('season markers not found in index.html — refusing to touch anything');
    process.exit(1);
  }
  const next = src.slice(0, i + START.length) + '\n' + season.html + '\n' + src.slice(j);
  if (next === src) { console.log('rotator: already showing the right season — no change'); return; }
  await writeFile('index.html', next);
  console.log(`rotator: homepage strip rotated for month ${month}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
