#!/usr/bin/env python3
"""Page checker for the TPS Pro overhaul. Usage: python3 research/check_pages.py file1.html [file2.html ...]
Reports problems per file; exit code 1 if any. Rules mirror research/build-spec.md."""
import json, os, re, sys
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
BANNED = [
    (r'crcp183', 'personal Gmail exposed'),
    (r'Jessica M\.|Daniel R\.|Sarah K\.', 'unsourced testimonial'),
    (r'200\+\s*(student\s*)?units|100\s*(to|–|-)\s*200', 'wrong unit stat'),
    (r'[Ss]ince 2022', 'wrong founding year'),
    (r'Saint Rose', 'College of Saint Rose (closed)'),
    (r'lorem ipsum|\[YOUR|TODO|TBD', 'placeholder text'),
    (r'formsubmit|netlify|data-netlify|action="mailto', 'old form handler'),
    (r'amp;amp;', 'double-encoded entity'),
    (r'\$\s?\d', 'dollar price (site is quote-based)'),
    (r'tpsprollc\.com|totalpropertysolutionspro\.com', 'old domain'),
]

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.errors, self.text = [], [], []
        self.h1 = 0; self.imgs = []; self.links = []; self.in_script = False; self.skip = 0
    def handle_starttag(self, t, a):
        a = dict(a)
        if t == 'h1': self.h1 += 1
        if t == 'img': self.imgs.append(a)
        if t == 'a' and a.get('href'): self.links.append(a['href'])
        if t in ('script', 'style'): self.skip += 1
        if t not in VOID: self.stack.append(t)
    def handle_startendtag(self, t, a): self.handle_starttag(t, a) if t in VOID else None
    def handle_endtag(self, t):
        if t in ('script', 'style'): self.skip = max(0, self.skip - 1)
        if t in VOID: return
        if t in self.stack:
            while self.stack and self.stack[-1] != t:
                self.errors.append(f'unclosed <{self.stack.pop()}> before </{t}>')
            self.stack.pop()
        else:
            self.errors.append(f'stray </{t}>')
    def handle_data(self, d):
        if not self.skip: self.text.append(d)

def check(path):
    probs = []
    s = open(path, encoding='utf-8').read()
    name = os.path.basename(path)
    p = P(); p.feed(s)
    probs += p.errors[:5]
    if p.stack: probs.append(f'unclosed at EOF: {p.stack[-5:]}')
    t = re.search(r'<title>(.*?)</title>', s, re.S)
    if not t: probs.append('missing <title>')
    else:
        tl = len(re.sub(r'&amp;', '&', t.group(1)))
        if not 40 <= tl <= 65: probs.append(f'title length {tl}')
    d = re.search(r'<meta name="description" content="(.*?)"', s, re.S)
    if not d: probs.append('missing meta description')
    else:
        dl = len(re.sub(r'&amp;', '&', d.group(1)))
        if not 120 <= dl <= 165: probs.append(f'description length {dl}')
    c = re.search(r'<link rel="canonical" href="(.*?)"', s)
    expect = 'https://totalpropertysolution.net/' + ('' if name == 'index.html' else name)
    if not c or c.group(1) != expect: probs.append(f'canonical should be {expect}')
    for tag in ('og:title', 'og:description', 'og:image', 'og:url', 'twitter:card'):
        if tag not in s: probs.append(f'missing {tag}')
    if 'G-0KM9JRJL2D' not in s: probs.append('missing GA tag')
    if 'fresh.css?v=20260928d' not in s: probs.append('css link not versioned v=20260928d')
    if 'class="sticky-cta"' not in s: probs.append('missing sticky CTA')
    if p.h1 != 1: probs.append(f'{p.h1} <h1> tags')
    for pat, why in BANNED:
        if re.search(pat, s): probs.append(f'banned: {why}')
    # JSON-LD
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    faq_q = []
    for b in blocks:
        try:
            j = json.loads(b)
        except Exception as e:
            probs.append(f'JSON-LD parse error: {e}'); continue
        items = j.get('@graph', [j]) if isinstance(j, dict) else j
        for it in items:
            ty = it.get('@type')
            if ty == 'FAQPage':
                faq_q += [q.get('name', '').strip() for q in it.get('mainEntity', [])]
            if 'aggregateRating' in json.dumps(it): probs.append('aggregateRating in schema')
    if faq_q:
        vis = ' '.join(re.sub(r'\s+', ' ', x) for x in p.text)
        missing = [q for q in faq_q if re.sub(r'\s+', ' ', q) not in vis]
        if missing: probs.append(f'{len(missing)} FAQ schema questions not visible, e.g. "{missing[0][:60]}"')
    # images
    for im in p.imgs:
        src = im.get('src', '')
        if src.startswith('http') or src.startswith('data:'): continue
        if not os.path.exists(os.path.join(ROOT, src.split('?')[0])): probs.append(f'missing image {src}')
        if not im.get('alt'): probs.append(f'no alt: {src}')
        if not (im.get('width') and im.get('height')): probs.append(f'no width/height: {src}')
    # links
    for h in p.links:
        if h.startswith(('http', 'mailto:', 'tel:', '#')): continue
        f = h.split('#')[0].split('?')[0]
        if f and not os.path.exists(os.path.join(ROOT, f)): probs.append(f'broken link {h}')
    words = len(' '.join(p.text).split())
    return probs, words

if __name__ == '__main__':
    bad = 0
    for f in sys.argv[1:]:
        path = f if os.path.isabs(f) else os.path.join(ROOT, f)
        if not os.path.exists(path): print(f'{f}: MISSING FILE'); bad = 1; continue
        probs, words = check(path)
        status = 'OK' if not probs else 'FIX'
        print(f'{status:3} {os.path.basename(f)} ({words} words)')
        for pr in dict.fromkeys(probs): print('     -', pr)
        bad |= bool(probs)
    sys.exit(bad)
