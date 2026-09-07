# WSTERA www Redirect

Purpose: make `www.wstera.com` a compatibility hostname only.

Canonical destination: `https://wstera.com`.

Behavior:
- Redirects every request with HTTP 308.
- Preserves path and query string.
- Does not route or proxy `platform.wstera.com` or any product subdomain.
- Contains no secrets and no product runtime dependency.

Deploy from the parent repository with Wrangler 4.125.0 or a compatible reviewed version:

`npx wrangler@4.125.0 deploy --config apps/wstera-www-redirect/wrangler.jsonc`

Verification:
- `https://www.wstera.com/` redirects to `https://wstera.com/`.
- A path/query such as `/health-check?source=www` is preserved on the apex destination.
- `https://wstera.com/` and `https://platform.wstera.com/` remain HTTP 200 after deployment.
