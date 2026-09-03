# Broker platform UI

Vite + React. Local APIs: copy [`.env.example`](.env.example) to `.env`.

Sign in / out are full browser navigations to `/auth/login` and `/auth/logout` (Auth0 via Identity). Session is `GET /auth/me` plus the `broker.access` cookie — no Auth0 SDK. Auth design and flow diagrams: [AUTH.md](../AUTH.md).

## AWS

Static files on **S3**, HTTPS via **CloudFront**. `/auth*` and `/cases*` go to the existing ALB (same origin, no CORS, no mixed content). Infra is Terraform in the **API** repo: `api/infra/frontend.tf`.

From `api/infra` (existing AWS credentials):

```powershell
terraform apply
terraform output ui_url
terraform output ui_bucket_name
terraform output ui_cloudfront_distribution_id
terraform output github_client_actions_role_arn
```

GitHub repo **variables** (Settings → Secrets and variables → Actions → Variables):

| Variable | Value |
|---|---|
| `AWS_ROLE_ARN` | `github_client_actions_role_arn` |
| `AWS_REGION` | `ap-southeast-2` |
| `S3_BUCKET` | `ui_bucket_name` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `ui_cloudfront_distribution_id` |

Push to `master` (or `release`) runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Production build uses empty `VITE_*` URLs so the browser calls `/auth` and `/cases` on the CloudFront host.
