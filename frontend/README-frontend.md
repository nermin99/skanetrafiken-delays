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

The frontend is deployed automatically to GitHub Pages using GitHub Actions CI/CD pipeline. It is triggered on code changes within the `frontend` directory on pushes or PR-merges to the `main` branch.

---

## AWS Amplify (Connecting frontend to DB)

The frontend reads from an AppSync GraphQL API + DynamoDB table that Amplify Gen 2 provisions from `amplify/`.

***This is a one-time setup.***

### Prerequisites

- AWS CLI

### Setup

1. Configure [AWS Amplify Credentials](https://docs.amplify.aws/react/start/account-setup/).
1. Open the [AWS Amplify console](https://console.aws.amazon.com/amplify/) and create a new app.
1. Connect this GitHub repository and select the `main` branch.
1. Set the app root to `frontend/` so Amplify picks up `amplify/backend.ts`.
1. Confirm — Amplify runs `npx ampx pipeline-deploy` and provisions the AppSync API and DynamoDB table.
1. After the first deploy completes, download the generated `amplify_outputs.json` from the Amplify console and commit it so the GitHub Pages build can talk to the deployed backend.

Subsequent pushes to `main` redeploys the backend automatically via Amplify.
