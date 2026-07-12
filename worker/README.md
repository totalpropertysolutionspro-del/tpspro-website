# TPS Pro lead pipe — direct to your inbox, no third party

Right now every quote form on the site opens the visitor's **own email app**
addressed straight to you (crcp183@gmail.com) — direct, zero third party, works
today. This Worker is the **upgrade**: form submissions get delivered silently
to your inbox from any device, even if the visitor has no email app set up.

Everything runs on **your** Cloudflare account (you already use Cloudflare for
the domain). No FormSubmit, no middleman.

## One-time setup (~10 minutes)

1. **Resend account** (free — 3,000 emails/month): sign up at resend.com.
   - Add & verify the domain `totalpropertysolution.net` (Resend gives you a few
     DNS records → add them in Cloudflare DNS). This lets the Worker send as
     `leads@totalpropertysolution.net`.
   - Create an API key → copy it.

2. **Deploy the Worker** (from this folder):
   ```bash
   cd worker
   npx wrangler login              # opens Cloudflare in your browser, sign in
   npx wrangler secret put RESEND_API_KEY   # paste the Resend key when prompted
   npx wrangler deploy
   ```
   Wrangler prints a URL like `https://tps-lead.<your-subdomain>.workers.dev`.

3. **(Recommended) Custom domain:** in the Cloudflare dashboard →
   Workers & Pages → `tps-lead` → Settings → Domains & Routes → add
   `lead.totalpropertysolution.net`.

4. **Flip the site to the Worker:** in `assets/fresh.js`, set
   ```js
   window.TPS_LEAD_ENDPOINT = 'https://lead.totalpropertysolution.net';
   ```
   (or the workers.dev URL). Commit + push. Done — every form now delivers
   silently to your inbox, with the "opens your email app" path as automatic
   fallback if the Worker is ever unreachable.

## Test it
```bash
curl -X POST https://lead.totalpropertysolution.net \
  -H 'Content-Type: application/json' \
  -d '{"subject":"TEST lead","name":"Test","phone":"518-555-0100","details":"hello"}'
```
You should get the email within seconds.

## What it does
- Receives the form JSON, formats a clean email, sends via Resend to LEAD_TO.
- Sets reply-to to the lead's email so you can reply straight to them.
- Drops bot spam via a honeypot field.
- CORS-locked to your domain.
