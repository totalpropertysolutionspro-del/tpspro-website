# TPS Pro lead pipe — direct to your inbox, no third party

Right now every quote form on the site opens the visitor's **own email app**
addressed straight to you (crcp183@gmail.com) — direct, zero third party, works
today. This Worker is the **upgrade**: form submissions get delivered silently
to your inbox from any device, even if the visitor has no email app set up.

It runs on **your** Cloudflare account and sends through **Cloudflare Email
Routing** — the same system that already forwards bookings@totalpropertysolution.net
to your Gmail. **No Resend, no SendGrid, no signup.** Because crcp183@gmail.com
is already a verified Email Routing destination, sends work immediately.

## Setup — dashboard, ~5 minutes, no command line

1. **Cloudflare dashboard → Workers & Pages → Create → Worker.** Name it
   `tps-lead`. Paste in the contents of `lead-worker.js`, then Deploy.
2. **Settings → Bindings → Add → "Send email".**
   - Variable name: `LEAD_MAIL`
   - Destination address: `crcp183@gmail.com`
   (If Cloudflare asks to verify the destination, it's already verified via your
   Email Routing — if not, click the verification link it emails you once.)
3. **Settings → Variables and Secrets** → add three plain text vars:
   - `LEAD_TO` = `crcp183@gmail.com`
   - `LEAD_FROM` = `leads@totalpropertysolution.net`
   - `ALLOW_ORIGIN` = `https://totalpropertysolution.net`
4. **(Recommended) Settings → Domains & Routes → Add** `lead.totalpropertysolution.net`.
5. **Tell me the Worker URL** (the `lead.totalpropertysolution.net` one, or the
   `tps-lead.<you>.workers.dev` one) and I'll set `window.TPS_LEAD_ENDPOINT` in
   `assets/fresh.js` and push — every form then delivers silently to your inbox,
   with the "opens your email app" method as automatic fallback if the Worker is
   ever unreachable.

### CLI alternative (if you prefer the terminal)
`wrangler.toml` is already configured with the send binding, so:
```bash
cd worker
npx wrangler login
npx wrangler deploy
```

## Test it
```bash
curl -X POST https://lead.totalpropertysolution.net \
  -H 'Content-Type: application/json' \
  -d '{"subject":"TEST lead","name":"Test","phone":"518-555-0100","details":"hello"}'
```
You should get the email within seconds.

## What it does
- Receives the form JSON, formats a clean HTML email, sends via Email Routing to LEAD_TO.
- Sets Reply-To to the lead's email so you reply straight to them.
- Drops bot spam via a honeypot field; requires a phone/email; caps field count/size.
- CORS-locked to your domain.
