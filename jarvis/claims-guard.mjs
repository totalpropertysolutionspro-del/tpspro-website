// Claims guard: fails if any page contains a claim banned in jarvis/claims-policy.json.
// Runs on every push, pull request and daily in GitHub Actions. Exit 1 = violation.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const policy = JSON.parse(readFileSync(new URL('./claims-policy.json', import.meta.url), 'utf8'));
const rules = policy.rules.map(r => ({ ...r, rx: new RegExp(r.pattern, 'gi') }));
const root = process.cwd();
const files = readdirSync(root).filter(f => f.endsWith('.html'));
const hits = [];
for (const f of files) {
  const lines = readFileSync(join(root, f), 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const r of rules) {
      r.rx.lastIndex = 0;
      const m = r.rx.exec(line);
      if (m) hits.push(`${f}:${i + 1} [${r.id}] "${line.slice(Math.max(0, m.index - 30), m.index + 60).trim()}" -> use: ${r.use_instead}`);
    }
  });
}
if (hits.length) {
  console.error(`CLAIMS GUARD FAILED: ${hits.length} banned claim(s)\n` + hits.join('\n'));
  process.exit(1);
}
console.log(`Claims guard OK: ${files.length} pages, ${rules.length} rules.`);
