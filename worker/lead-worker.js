// TPS Pro — lead-worker.js
// A Cloudflare Worker on YOUR account that receives quote-form submissions and
// emails them straight to you. No third-party form service ever holds a lead.
//
// Deploy: see worker/README.md. Once live, set window.TPS_LEAD_ENDPOINT in
// assets/fresh.js to this Worker's URL and every form upgrades from "opens your
// email app" to "silently delivered to your inbox from any device."
//
// Secrets used (set with `npx wrangler secret put <NAME>`):
//   RESEND_API_KEY   — from resend.com (free tier: 3,000 emails/mo)
// Vars (in wrangler.toml [vars]):
//   LEAD_TO          — where leads land (crcp183@gmail.com)
//   LEAD_FROM        — verified sender, e.g. leads@totalpropertysolution.net
//   ALLOW_ORIGIN     — https://totalpropertysolution.net

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || 'https://totalpropertysolution.net';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: cors });

    let data;
    try { data = await request.json(); } catch { return json({ error: 'bad json' }, 400, cors); }

    // Honeypot: bots fill hidden fields; drop silently with a 200 so they don't retry.
    if (data._gotcha || data.website) return json({ ok: true }, 200, cors);

    const subject = (data.subject || 'New lead — totalpropertysolution.net').toString().slice(0, 160);
    const rows = Object.keys(data)
      .filter((k) => k !== 'subject' && k[0] !== '_' && data[k])
      .map((k) => {
        const label = k.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return `<tr><td style="padding:6px 12px;font-weight:700;vertical-align:top">${esc(label)}</td><td style="padding:6px 12px">${esc(data[k])}</td></tr>`;
      }).join('');

    const html = `<div style="font-family:system-ui,Arial,sans-serif;max-width:560px">
      <h2 style="color:#0E3A19;margin:0 0 4px">New lead from totalpropertysolution.net</h2>
      <p style="color:#47584B;margin:0 0 14px">${esc(subject)}</p>
      <table style="border-collapse:collapse;width:100%;border:1px solid #E2E7DB">${rows}</table>
      <p style="color:#7C8A7F;font-size:12px;margin-top:14px">Page: ${esc(data.page || '')}</p>
    </div>`;

    const text = Object.keys(data)
      .filter((k) => k !== 'subject' && k[0] !== '_' && data[k])
      .map((k) => `${k}: ${data[k]}`).join('\n');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.LEAD_FROM || 'leads@totalpropertysolution.net',
        to: [env.LEAD_TO || 'crcp183@gmail.com'],
        reply_to: data.email || undefined,
        subject,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return json({ error: 'send failed', detail: body.slice(0, 200) }, 502, cors);
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
