# AWS Amplify Deployment Guide for IDA-Emisor-Web

## Prerequisites (before any production deploy)

Decide and record (do **not** commit production secrets to git):

| Item | Notes |
|------|--------|
| **Production API base URL** | Stable `https://...` identity API (TLS + DNS or reverse proxy in front of the API). Replace placeholder `https://YOUR_PROD_IDENTITY_API_HOST` in runbooks until the hostname is final. |
| **Production API key** | Issuer/API key accepted by that backend. Configure only in Amplify (or Vercel) **environment variables**, marked sensitive where supported. |
| **Git branch** | e.g. `main` or a dedicated `production` branch so merges to `main` do not automatically ship to prod unless intended. |

The Next.js app calls the backend through [`app/api/proxy/route.ts`](app/api/proxy/route.ts) (same-origin `/api/proxy`), so the browser CSP stays on `'self'`; `NEXT_PUBLIC_API_BASE_URL` is still required at **build time** for the proxy and for [`next.config.mjs`](next.config.mjs) (CSP `connect-src` and `images.remotePatterns` for credential images).

---

## Standard layout: two Amplify apps (Rootstock testnet vs mainnet)

Use **two separate Amplify applications**. Each app has its own Hosting → **Environment variables** (branch-scoped). Editing variables on one app must never be the only place you “switch” environments—overwriting branch env on a single app is how non-prod gets replaced by prod targets.

| Amplify app (example name) | Identity API (`NEXT_PUBLIC_API_BASE_URL`) | Chain | `NEXT_PUBLIC_API_KEY` |
|----------------------------|-------------------------------------------|-------|------------------------|
| **`ida-emisor-web-testnet`** (non-prod) | Base URL of the backend whose `WEB3_*` points at **Rootstock testnet (chain 31)** | 31 | Key provisioned **only** on that testnet/staging API |
| **`ida-emisor-web-prod`** | **`https://api-ssi.iovf.org`** (or interim HTTPS/proxy URL for the mainnet node) | 30 | Key provisioned **only** on the production API |

Both apps may build from the **same Git branch** (for example `main`); isolation comes from **different Amplify apps** and **different env vars**, not from branch name alone.

### Operator audit checklist (confirm you are not sharing one app)

In **AWS Console → Amplify**, for **each** app:

1. Open the app → **Hosting** → **Environment variables** → select the connected branch (for example `main`).
2. Confirm **`NEXT_PUBLIC_API_BASE_URL`** matches the intended backend (testnet vs mainnet host).
3. Confirm **`NEXT_PUBLIC_API_KEY`** is the key that works **only** on that backend (keys are not portable across deployments; see [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)).
4. After any change, trigger a **new build** (`NEXT_PUBLIC_*` are embedded at `next build` time).

If you use the AWS CLI, your IAM principal needs Amplify read/write actions (for example `amplify:ListApps`, `amplify:GetApp`, `amplify:UpdateApp`); otherwise perform the same checks in the console.

### Create the non-prod app (console)

1. **Amplify** → **Create new app** → **Host web app** → connect **GitHub** (same repository as prod).
2. **App name:** e.g. `ida-emisor-web-testnet` (must not reuse the prod app name).
3. **Branch:** the branch you want for internal QA (often `main` or `develop`).
4. **Build specification:** repository root [`amplify.yml`](amplify.yml).
5. Finish the wizard and wait for the first build, or run **Redeploy** after setting env vars below.

### Create the non-prod app (CLI without GitHub token)

You can create the Amplify app and `main` branch with the AWS CLI (`create-app`, `create-branch`, `update-branch`) **before** GitHub is linked. Builds will not run until you either:

- run `aws amplify update-app --app-id <APP_ID> --repository https://github.com/<org>/ida-emisor-web --access-token <GITHUB_PAT>`, or  
- use the console **Connect repository** / **Connect branch** for the same repo as prod.

Current app IDs are recorded in [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md). If your default IAM user lacks Amplify permissions, use **SSO** as in [docs/AWS-Environment-Duplication-Guide.md](../docs/AWS-Environment-Duplication-Guide.md) (*AWS Amplify Hosting*).

### Non-prod environment variables

On **`ida-emisor-web-testnet`** (or your chosen name), set branch-scoped variables:

- `NEXT_PUBLIC_API_BASE_URL` — identity API for **chain 31** (lab/staging EC2, Azure staging, or other testnet-aligned host from your ops record).
- `NEXT_PUBLIC_API_KEY` — issuer key registered on **that** API only.

Then **Redeploy** this app.

### Production environment variables

On **`ida-emisor-web-prod`**, set:

- `NEXT_PUBLIC_API_BASE_URL` — **`https://api-ssi.iovf.org`** when DNS/TLS for the prod API is aligned (see [docs/identity/identity-web3-node-prod-post-ami.md](../docs/identity/identity-web3-node-prod-post-ami.md)); avoid leaving prod on a raw `http://` IP once HTTPS is available.
- `NEXT_PUBLIC_API_KEY` — production issuer key **only** for the mainnet API.

Then **Redeploy** this app.

### Domains and bookmarks

- Map the **production** custom domain (if any) **only** to **`ida-emisor-web-prod`** and its production branch.
- Non-prod: use the default **`https://main.<app-id>.amplifyapp.com`** URL, or attach a **staging** subdomain (for example `emisor-staging.<your-domain>`) to the testnet app—never point the prod hostname at the testnet app.
- Record both default Amplify URLs and any custom hostnames in [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) after creation.

---

## New Backend Configuration (legacy / test examples)

Older examples used a direct HTTP IP; **production must use HTTPS.** Examples below mix historical values—rotate any key that was ever published.

**API Base URL (example):** `http://100.27.228.0:3000/`  
**API Key (example):** `tHeSecreastPasswrdEv4159`

---

## Deployment Options

### Option 1: Update Vercel Deployment (Current)

The current site at https://ida-emisor.vercel.app is deployed on Vercel. To update it:

1. Go to Vercel dashboard
2. Select the `ida-emisor-web` project
3. Go to Settings → Environment Variables
4. Update:
   - `NEXT_PUBLIC_API_BASE_URL` = your HTTPS API URL (no secrets in repo)
   - `NEXT_PUBLIC_API_KEY` = production key (store as **encrypted** / sensitive in Vercel)
5. Redeploy the application

---

### Option 2: Deploy to AWS Amplify (testnet / lab naming)

For the **recommended two-app layout** (testnet app + prod app), follow [Standard layout: two Amplify apps](#standard-layout-two-amplify-apps-rootstock-testnet-vs-mainnet) first, then use the CLI snippets below if you prefer automation.

To deploy to AWS Amplify (example name `ida-emisor-web-testnet`):

1. **Connect GitHub Repository**
   ```bash
   # First, create a GitHub personal access token with repo permissions
   # Then run:
   aws amplify create-app --profile manuel \
     --name "ida-emisor-web-testnet" \
     --repository "https://github.com/Ikabott-MRM/IDA-Emisor-Web" \
     --access-token "YOUR_GITHUB_TOKEN" \
     --platform WEB
   ```

2. **Create Branch Connection**
   ```bash
   aws amplify create-branch --profile manuel \
     --app-id APP_ID_FROM_STEP_1 \
     --branch-name main
   ```

3. **Set Environment Variables**
   ```bash
   aws amplify update-app --profile manuel \
     --app-id APP_ID_FROM_STEP_1 \
     --environment-variables \
       NEXT_PUBLIC_API_BASE_URL=http://100.27.228.0:3000/ \
       NEXT_PUBLIC_API_KEY=tHeSecreastPasswrdEv4159
   ```

4. **Start Deployment**
   ```bash
   aws amplify start-job --profile manuel \
     --app-id APP_ID_FROM_STEP_1 \
     --branch-name main \
     --job-type RELEASE
   ```

---

### Option 3: Production — new Amplify app (recommended)

Use a **separate** Amplify app (e.g. `ida-emisor-web-prod`) alongside **`ida-emisor-web-testnet`** so testnet/lab apps are not overwritten and environment variables stay isolated. See [Standard layout: two Amplify apps](#standard-layout-two-amplify-apps-rootstock-testnet-vs-mainnet).

Use the **same** production identity API base URL (HTTPS) as the mobile apps unless you intentionally split backends; see [docs/identity/identity-web3-node-prod-post-ami.md](../docs/identity/identity-web3-node-prod-post-ami.md) §5 and the repo-wide [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md).

#### Current production/testnet state (as of 2026-05-08)

- Amplify app **`ida-emisor-web-prod`** (`appId`: `d1fkse5la21xp8`), branch **`main`**, URL `https://main.d1fkse5la21xp8.amplifyapp.com/`.
- Prod branch env: `NEXT_PUBLIC_API_BASE_URL` **`https://api-ssi.iovf.org/`** and a **rotated prod-only** `NEXT_PUBLIC_API_KEY` (configured 2026-05-08). Release job **#9** was started after the key update; confirm final status in the Amplify console.
- Non-prod app **`IDA-Emisor-Web`** (`appId` **`d259s5nn01m0g8`**, branch **`dev`**, URL `https://dev.d259s5nn01m0g8.amplifyapp.com/`) is now Git-connected to `https://github.com/ikabott-mrm/ida-emisor-web` and deployed.
- Legacy app **`ida-emisor-web-testnet`** (`d2k82kzpd7gjdk`) remains repository-null (manual mode). Keep only as fallback and retire once `d259s5nn01m0g8` is accepted.

#### 3.1 Console (first-time setup)

1. AWS Console → **Amplify** → **Create new app** → **Host web app** → connect **GitHub** (OAuth or PAT).
2. Repository: **`Ikabott-MRM/IDA-Emisor-Web`** (or your canonical fork/org).
3. Branch: your **production** branch (see prerequisites).
4. Build settings: use repository [`amplify.yml`](amplify.yml) at the repo root.
5. Start the first build. If the job fails on Next.js artifacts, compare logs with [Deploy a Next.js app to Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html) and adjust `amplify.yml` if AWS requires a newer pattern for your region/account.

#### 3.2 Environment variables (production branch)

Amplify → your **prod** app → **Hosting** → **Environment variables** (branch-scoped):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Production identity API base URL (prefer HTTPS when API hostname is fully aligned; consistent trailing slash optional because proxy strips trailing slashes). |
| `IDENTITY_API_KEY` | Server-only issuer API key used by `app/api/proxy/route.ts`; mark as **secret** / sensitive in Amplify. |
| `NEXTAUTH_URL` | Public URL for the deployed branch (for example `https://main.d1fkse5la21xp8.amplifyapp.com`). |
| `NEXTAUTH_SECRET` | Random secret used by NextAuth to sign session tokens (`openssl rand -base64 32`). |
| `COGNITO_CLIENT_ID` | Cognito app client ID for this environment. |
| `COGNITO_CLIENT_SECRET` | Cognito app client secret for this environment; store as secret. |
| `COGNITO_ISSUER` | Cognito OIDC issuer URL: `https://cognito-idp.us-east-1.amazonaws.com/<USER_POOL_ID>`. |
| `COGNITO_DOMAIN` | Cognito Hosted UI domain host, e.g. `ida-emisor-prod-42351.auth.us-east-1.amazoncognito.com`. |
| `NEXT_PUBLIC_API_KEY` | Legacy fallback key used by older releases. Keep temporarily during transition; remove after auth rollout is verified. |

**Creating this key:** The value must exist in the **same MySQL** the prod identity API uses (hashed rows in `api_keys`). From the `identity/` repo, run the script documented in [`identity/README.md`](../identity/README.md) under *create-api-key.ts* (or `npm run api-key:create -- "<description>" "<encryption-password>"`). The script prints the plaintext key once; paste it into Amplify as `IDENTITY_API_KEY` (and optionally `NEXT_PUBLIC_API_KEY` while migrating)—never commit it. If keys already exist in that database, use the **same** encryption password as when the first key was created.

Redeploy (or trigger a new build) after every change so `next build` embeds the correct `NEXT_PUBLIC_*` values.

#### 3.3 Custom domain (recommended)

Amplify → **Domain management** → add your production hostname → complete **ACM** DNS validation → map the domain to the production branch. Update bookmarks and any integrations that still point at Vercel or old hostnames.

If custom-domain cutover is pending, you can run production on `https://main.d1fkse5la21xp8.amplifyapp.com/` temporarily and keep `https://ida-emisor.vercel.app` as rollback.

#### 3.4 CLI alternative (automation)

Same flow as Option 2, but with a **new** app name and **HTTPS** variables, for example:

```bash
aws amplify create-app --profile manuel \
  --name "ida-emisor-web-prod" \
  --repository "https://github.com/Ikabott-MRM/IDA-Emisor-Web" \
  --access-token "YOUR_GITHUB_TOKEN" \
  --platform WEB

aws amplify create-branch --profile manuel \
  --app-id APP_ID_FROM_STEP_1 \
  --branch-name production

aws amplify update-app --profile manuel \
  --app-id APP_ID_FROM_STEP_1 \
  --environment-variables \
    NEXT_PUBLIC_API_BASE_URL=https://YOUR_PROD_IDENTITY_API_HOST \
    NEXT_PUBLIC_API_KEY=YOUR_SECRET_KEY

aws amplify start-job --profile manuel \
  --app-id APP_ID_FROM_STEP_1 \
  --branch-name production \
  --job-type RELEASE
```

Do not paste real keys into shell history; prefer the console or CI with OIDC and stored secrets.

---

## Local Development

For local testing, create a `.env.local` file (see [`.env.example`](.env.example)):

```
NEXT_PUBLIC_API_BASE_URL=https://your-staging-or-dev-api.example.com
IDENTITY_API_KEY=your-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
COGNITO_CLIENT_ID=your-cognito-client-id
COGNITO_CLIENT_SECRET=your-cognito-client-secret
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/your-user-pool-id
COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
```

Then run:

```bash
npm run dev
```

---

## Security Note

Serving the issuer UI over **HTTPS** while calling an **HTTP** API from the browser causes mixed-content issues; this app uses **`/api/proxy`** so the browser talks same-origin HTTPS and the server calls the backend. For production:

1. Use a stable **HTTPS** API URL in `NEXT_PUBLIC_API_BASE_URL`.
2. Keep `IDENTITY_API_KEY`, `NEXTAUTH_SECRET`, and `COGNITO_CLIENT_SECRET` out of git; use Amplify/Vercel environment configuration.
3. Rotate any key that appeared in old revisions of this guide or in chat logs.

---

## Verification (smoke checklist)

After deploy:

1. **Build:** Locally run `npm ci` and `npm run build` with the same `NEXT_PUBLIC_*` values you set in Amplify (confirms Next config and types).
2. **Runtime:** Open the Amplify URL (or custom domain), load credenciales, confirm list loads via `/api/proxy`.
3. **Browser devtools:** Network tab shows HTTPS requests to your own origin for API traffic; no mixed-content errors.
4. **Images:** Credential thumbnails load (Next `images.remotePatterns` includes the API host from `NEXT_PUBLIC_API_BASE_URL` at build time).

Optional: enable Amplify access logs or CloudWatch for 4xx/5xx on the distribution.
