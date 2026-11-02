# AutoInvoice frontend: security audit (November 2026)

## 1. Run summary

| | |
|---|---|
| Method | OWASP Top 10:2025 review plus the [Cloudflare security-audit skill](https://github.com/cloudflare/security-audit-skill), "quick" profile |
| Scope | `AutoInvoice-frontend`. The backend was read only to check the controls the frontend depends on: cookies, CORS, authorization. |
| Source ref | `69f3bc9`, clean tree. All line numbers in this report refer to that commit. |
| Execution | Source review plus local-only checks: a production build, a headless Chromium smoke test with the new CSP, and an OpenAPI generator diff. No deployed system was contacted. |
| Prior runs | None. This is the first run, so no prior ledger exists. |
| Independent verification | One fresh reviewer re-checked every record against the source. All 9 records were verified, with wording and line corrections only, and no uncovered root causes were found. |
| Machine-readable output | `findings.json` and `coverage-ledger.json`, both passing the skill's validators |

This is a quick-profile pass, so it is partial coverage. One coverage unit was run per surface × boundary × attack class, and only one reviewer was used. The backend was not audited, so backend-only issues are out of scope here: JWT revocation, login CSRF, and rate limiting.

## 2. Security posture

There are **no confirmed vulnerabilities** in the frontend source. The app renders everything through React's escaped JSX, with no `dangerouslySetInnerHTML`, `innerHTML` or `eval` anywhere. Auth uses HttpOnly + SameSite=Lax cookies rather than tokens in JS storage. Every admin action is enforced again on the server.

The real risk was in the **supply chain and deployment configuration**. `npm audit` reported 25 advisories (3 critical, 18 high). The nginx config sent no security headers. The Docker build used an end-of-life Node runtime, `npm install` instead of `npm ci`, and an unpinned `nginx:1` tag. All of these have been fixed on this branch.

## 3. Confirmed findings

None.

## 4. Needs validation (no severity assigned)

| Lead | Trace | Blocker | Safe check |
|---|---|---|---|
| **Framing / missing CSP**: the old `nginx.conf` sent no `frame-ancestors`, X-Frame-Options or CSP, so the admin "Delete user" dialog could be framed (`client/nginx-no-frame-ancestors-or-csp`) | `nginx.conf:4` → `routes/_layout/admin.jsx:17` → `components/Admin/DeleteUser.jsx:27` | SameSite=Lax blocks this from cross-site pages. It is only exploitable from a *same-site* host, such as a sibling subdomain. The deployed domain layout isn't in the repo. | Owner: list every host that shares the frontend's registrable domain, and confirm the deployed headers. **Fixed anyway:** the new nginx template sends `frame-ancestors 'none'` and `X-Frame-Options: DENY`. |
| **Vite 7.3.1 dev-server advisories**: file read, `fs.deny` bypass, WebSocket file read (`supply-chain/vite-7.3.1-dev-server-advisories`) | `package.json:7` (`vite`), `package.json:64` | Only reachable if a developer runs `vite --host` on a shared network. The default binds to localhost. | Owner: confirm that no runbook or devcontainer exposes the dev server. **Fixed anyway:** upgraded to Vite 8.3.5. |

## 5. Rejected candidates

These were checked and ruled out; they are kept to avoid re-reporting.

| Candidate | Why it is not a finding |
|---|---|
| Admin pages guarded only client-side | The backend enforces `get_current_active_superuser` on list, create, update and delete user (`users.py:34,54,183,213`). |
| CSRF through cookie session + `withCredentials` | SameSite=Lax cookies, an explicit CORS allowlist, and no state-changing GET endpoints. |
| axios 1.13.4 prototype-pollution gadgets | The app source has no pollution primitive, and the Node-adapter advisories don't apply in the browser. Upgraded anyway. |
| CSV formula injection in data-table export | Data tables are per-tab, in memory, and authored by the user, so any effect is self-impact. Hardened anyway. |
| `encodeURI` on API path params | ID params are server-issued UUIDs, and the email param is typed by the requester for their own request. |
| Reset token leaking via `Referer` | The page loads no third-party resources, and the browser's default referrer policy strips the query string. `no-referrer` was added anyway. |
| Logout failure ignored silently | The UI doesn't change on failure, so the user isn't misled. An error toast was added. |

## 6. OWASP Top 10:2025 coverage

| Category | Result |
|---|---|
| A01 Broken Access Control | ✅ Client guards are UI-only and the server enforces authorization (rejected candidate above) |
| A02 Security Misconfiguration | ⚠️ No security headers and `server_tokens` on → **fixed** (CSP, XFO, nosniff, Referrer-Policy, Permissions-Policy, COOP) |
| A03 Software Supply Chain Failures | ⚠️ 25 npm advisories, `npm install` in Docker, mutable `nginx:1` tag → **fixed** (1 moderate dev-only advisory remains, see §8) |
| A04 Cryptographic Failures | ✅ No crypto or secrets in the client. Cookies are `Secure` outside local. HSTS should be set at the TLS terminator. |
| A05 Injection | ✅ No XSS sinks. CSV export now neutralises formula prefixes. |
| A06 Insecure Design | ✅ Tokens are HttpOnly cookies, not localStorage |
| A07 Authentication Failures | ✅ Login, reset and logout flows reviewed. Logout now reports failures. |
| A08 Software or Data Integrity Failures | ✅ Lockfile is now enforced with `npm ci`. Generated client output verified as unchanged. |
| A09 Security Logging & Alerting Failures | n/a for a static SPA (backend concern) |
| A10 Mishandling of Exceptional Conditions | ✅ API errors are shown as escaped text. 401/403 responses redirect to `/login`. |

## 7. Changes made on this branch

**Dependencies.** `npm audit`: 25 advisories → 1 moderate, dev-only.

- `axios` 1.13.4 → 1.21.0 (kept as an exact pin)
- `vite` 7.3.1 → 8.3.5; `@vitejs/plugin-react-swc` → 4.3.3; `@tanstack/router-plugin` → 1.168.48
- `@hey-api/openapi-ts` 0.73.0 → 0.86.12. This is the newest release that still has the `legacy/axios` client. Generated output from the backend's current OpenAPI schema is identical apart from one TypeScript return-type annotation.
- `zod` → 4.6.7, `react`/`react-dom` → 19.3.1, `@tanstack/react-query` → 5.105.2, `@tanstack/react-router` → 1.170.46, `tailwindcss` → 4.3.3, all Radix packages to latest, `@biomejs/biome` → 2.6.4 (config migrated), `@playwright/test` → 1.64.1
- `overrides`: `handlebars ^4.7.10` (critical advisories in the generator) and `esbuild ^0.28.2`
- Removed unused packages: `form-data` (vulnerable, Node-only), `react-icons`, `react-error-boundary`, `@tanstack/react-query-devtools`, `@tanstack/react-router-devtools`, `@tanstack/router-devtools`
- Added `engines.node >=22.12.0`

**Deployment**

- `nginx.conf` → `nginx/default.conf.template`, which adds a CSP (`connect-src` comes from `VITE_API_URL`), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP and `server_tokens off`
- `Dockerfile`: `node:24-alpine` (Node 20 is EOL), `npm ci`, `nginx:1.30-alpine`
- `.dockerignore`: excludes `.git`, `.env*` and test output
- `Dockerfile.playwright`: image bumped to `v1.64.1` to match `@playwright/test`

**Source**

- `ExportMenu.jsx`: CSV cells starting with `= + - @ \t \r` get a `'` prefix. Plain numbers are left alone.
- `useAuth.js`: a failed logout now shows an error toast.
- `.tanstack/` generator scratch files untracked and ignored.

**Verified with:** `npm run build`; Biome (26 errors, all pre-existing, down from 30); headless Chromium on `/`, `/login`, `/signup`, `/reset-password` and an error toast, all served with the exact production CSP and showing **zero CSP violations**; the OpenAPI generator diff. The Docker image could not be built in the audit sandbox (no Docker daemon), so run `docker compose build` once before deploying.

## 8. Remaining recommendations (not done)

1. **Migrate the API client off `legacy/axios`.** `@hey-api/openapi-ts` <0.97.3 has GHSA-hhx9-57xq-r5rw. The vulnerable `buildClientParams` template isn't present in the legacy client this repo generates, and the generator is dev-only. Clearing the advisory still requires moving to `@hey-api/client-axios` on ≥0.99, which changes every `*Service` call site.
2. **HSTS**: enable it in the nginx template, or at the TLS-terminating proxy, once the site is HTTPS-only.
3. **CSP `style-src 'unsafe-inline'`** is needed by the toast and Radix libraries' runtime styles. Tighten it with nonces if you add SSR.
4. A 403 response (insufficient privileges) currently redirects to `/login` (`src/main.jsx:28`). Consider showing a "not allowed" page instead.
5. `Dockerfile.playwright` refers to `bun.lock` and a `frontend/` folder that don't exist in this repo.
6. `src/routeTree.gen.ts` is a stale duplicate of the generated `.js` file and can be deleted.
7. Non-security major upgrades were deliberately left for a separate change: `lucide-react` 1.x, `@tanstack/react-table` 9, `@hookform/resolvers` 7, `dotenv` 18.
8. **Backend** (not audited here): logout doesn't revoke the JWTs server-side, and there is no rate limiting on login or password recovery.

## 9. Coverage

12 ledger units: 9 candidate, 2 covered, 1 not applicable (no postMessage, WebSocket or service worker). The covered and candidate surfaces are:

- auth guards
- CSRF and cookies
- DOM rendering
- framing and headers
- the dependency tree
- CSV export
- API path building
- password reset
- logout
- browser storage
- secrets and debug gates

0 blocked, 0 deferred.
