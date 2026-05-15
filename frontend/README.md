# Frontend

The [https://skanetrafiken-delays.se](https://skanetrafiken-delays.se/) web app. Reads delay data from a DynamoDB table via an AppSync GraphQL API, both provisioned by [AWS Amplify Gen 2](https://docs.amplify.aws/) (see [`amplify/data/resource.ts`](amplify/data/resource.ts)).

## Local development

### Prerequisites

- Node.js v24+

### Setup

```shell
npm install
```

### Start

```shell
npm start
```

## Automated Deployment

The frontend is deployed automatically to GitHub Pages using GitHub Actions CI/CD pipeline. It is triggered on code changes in the `frontend` directory on pushes or PR-merges to the `main` branch.

---

## AWS Amplify (Connecting frontend to DB)

The frontend reads from an AppSync GraphQL API + DynamoDB table provisioned by Amplify Gen 2 from `amplify/`. Connection details live in `amplify_outputs.json`, which is bundled into the build.

### Automated deployment

The `Amplify Backend` workflow (`.github/workflows/amplify.yml`) runs on pushes to `main` that touch `frontend/amplify/**`. It executes `npx ampx pipeline-deploy`, which redeploys the AppSync API and DynamoDB table. If the redeploy regenerates `amplify_outputs.json`, the workflow commits it back to `main` — that commit then triggers the `Frontend` workflow, which rebuilds and redeploys GitHub Pages with the new endpoint baked in.

### Manual deployment

Useful when iterating on the schema locally or if the GitHub Actions deploy fails.

```shell
aws sso login
eval "$(aws configure export-credentials --profile default --format env)"
CI=true npx ampx pipeline-deploy --branch main --app-id <appId>
```

Commit and push the regenerated `amplify_outputs.json` so the frontend build picks up the new endpoint.

For iterative schema work against a personal sandbox stack instead of prod:

```shell
npx ampx sandbox
```

### First-time setup (for automated deployment)

***This is a one-time setup and has already been done.*** Reference for re-provisioning from scratch.

#### Prerequisites

- AWS account with admin access
- AWS CLI

#### Steps

1. **Create an IAM Identity Center permission set** (e.g. `amplify-policy`) with these AWS-managed policies attached:
   - `AdministratorAccess-Amplify`
   - `AmplifyBackendDeployFullAccess`

1. **Configure the AWS CLI with SSO.** Follow the prompts; default region `eu-north-1`.

   ```shell
   aws configure sso
   ```

1. **Create the Amplify Hosting app** (purely as a namespace for `pipeline-deploy` — no frontend hosting):

   ```shell
   aws amplify create-app --name skanetrafiken-delays --region eu-north-1
   ```

   Note the returned `appId` — it's referenced in `.github/workflows/amplify.yml` and the manual deployment steps above.

1. **Create the `main` branch resource** on the app:

   ```shell
   aws amplify create-branch --app-id <appId> --branch-name main --region eu-north-1
   ```

1. **Bootstrap the backend** with a one-off local pipeline-deploy. This provisions the CloudFormation stack (AppSync + DynamoDB + IAM) and writes `amplify_outputs.json`.

   ```shell
   eval "$(aws configure export-credentials --profile default --format env)"
   CI=true npx ampx pipeline-deploy --branch main --app-id <appId>
   ```

   Commit `frontend/amplify_outputs.json`.

1. **Create the GitHub OIDC provider** in AWS so GitHub Actions can authenticate without long-lived credentials:

   ```shell
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   ```

1. **Create the IAM role GitHub Actions assumes.** Save the trust policy below as `/tmp/gha-trust.json`, replacing `<account-id>` and the repo path:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": {
         "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
       },
       "Action": "sts:AssumeRoleWithWebIdentity",
       "Condition": {
         "StringEquals": {
           "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
         },
         "StringLike": {
           "token.actions.githubusercontent.com:sub": "repo:<owner>/<repo>:*"
         }
       }
     }]
   }
   ```

   Then create the role and attach the deploy policy:

   ```shell
   aws iam create-role \
     --role-name amplify-pipeline-deploy \
     --assume-role-policy-document file:///tmp/gha-trust.json

   aws iam attach-role-policy \
     --role-name amplify-pipeline-deploy \
     --policy-arn arn:aws:iam::aws:policy/service-role/AmplifyBackendDeployFullAccess
   ```

1. **Add the role ARN as a GitHub repo secret** in Settings → Secrets and variables → Actions:
   - Name: `AWS_DEPLOY_ROLE_ARN`
   - Value: `arn:aws:iam::<account-id>:role/amplify-pipeline-deploy`
