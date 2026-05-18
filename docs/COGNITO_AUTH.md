# Cognito Auth Runbook

This runbook documents the Cognito setup used by `IDA-Emisor-Web` with NextAuth.

## Current resources

- **Region:** `us-east-1`
- **Dev user pool:** `us-east-1_M1yPUr1m6`
- **Dev hosted UI domain:** `ida-emisor-dev-88502.auth.us-east-1.amazoncognito.com`
- **Dev app client:** `4lr5gjj9kd26d0avfna9uqib9`
- **Prod user pool:** `us-east-1_VLok2ozQ6`
- **Prod hosted UI domain:** `ida-emisor-prod-42351.auth.us-east-1.amazoncognito.com`
- **Prod app client:** `6n193icf5uh5pmp1vef7gqvbh8`

## Required environment variables

Set these for each Amplify branch (`dev` and `main`):

- `NEXT_PUBLIC_API_BASE_URL`
- `IDENTITY_API_KEY`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `COGNITO_CLIENT_ID`
- `COGNITO_CLIENT_SECRET`
- `COGNITO_ISSUER`
- `COGNITO_DOMAIN`

## Callback and logout URLs

### Dev

- Callback: `http://localhost:3000/api/auth/callback/cognito`
- Callback: `https://dev.d259s5nn01m0g8.amplifyapp.com/api/auth/callback/cognito`
- Logout: `http://localhost:3000/`
- Logout: `https://dev.d259s5nn01m0g8.amplifyapp.com/`

### Prod

- Callback: `https://main.d1fkse5la21xp8.amplifyapp.com/api/auth/callback/cognito`
- Logout: `https://main.d1fkse5la21xp8.amplifyapp.com/`

## CLI commands (create resources)

### Create pool

```powershell
aws cognito-idp create-user-pool `
  --pool-name "ida-emisor-web-<env>" `
  --auto-verified-attributes email `
  --username-attributes email `
  --username-configuration CaseSensitive=false `
  --policies "PasswordPolicy={MinimumLength=12,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" `
  --account-recovery-setting "RecoveryMechanisms=[{Name=verified_email,Priority=1}]" `
  --region us-east-1 --profile manuel
```

### Enable self sign-up

```powershell
aws cognito-idp update-user-pool `
  --user-pool-id <POOL_ID> `
  --admin-create-user-config AllowAdminCreateUserOnly=false `
  --region us-east-1 --profile manuel
```

### Create hosted UI domain

```powershell
aws cognito-idp create-user-pool-domain `
  --domain "ida-emisor-<env>-<suffix>" `
  --user-pool-id <POOL_ID> `
  --region us-east-1 --profile manuel
```

### Create app client

```powershell
aws cognito-idp create-user-pool-client `
  --user-pool-id <POOL_ID> `
  --client-name "ida-emisor-web-<env>-nextauth" `
  --generate-secret `
  --allowed-o-auth-flows code `
  --allowed-o-auth-flows-user-pool-client `
  --allowed-o-auth-scopes openid email profile `
  --supported-identity-providers COGNITO `
  --callback-urls "<CALLBACK_URLS...>" `
  --logout-urls "<LOGOUT_URLS...>" `
  --region us-east-1 --profile manuel
```

## Troubleshooting

- **`/login` or `/api/auth/*` returns 404 in Amplify:** the current Git branch deployment does not include auth files yet. Ensure branch code includes `app/login/page.tsx`, `app/api/auth/[...nextauth]/route.ts`, `auth.ts`, and `middleware.ts`.
- **`/api/proxy` returns 401 while logged in:** verify `NEXTAUTH_SECRET` matches runtime and session cookies are present.
- **`/api/auth/signin/cognito` redirects with error:** check `COGNITO_ISSUER`, `COGNITO_DOMAIN`, client ID/secret, and callback URL exact match.
- **Cognito signup via CLI fails with secret error:** include `--secret-hash` for app clients configured with secret.
