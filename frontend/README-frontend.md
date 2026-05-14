# Frontend

The [skanetrafiken-delays.se](https://skanetrafiken-delays.se/) web app. Reads delay data from a DynamoDB table via an AppSync GraphQL API, both provisioned by [AWS Amplify Gen 2](https://docs.amplify.aws/) (see [amplify/data/resource.ts](amplify/data/resource.ts)).

## Prerequisites

- Node.js v24+
- AWS credentials configured (for the Amplify sandbox)

## Local development

Install dependencies:

```shell
npm install
```

In one terminal, start the Amplify sandbox, which provisions a personal copy of the backend and writes `amplify_outputs.json`:

```shell
npx ampx sandbox
```

In another, start the dev server:

```shell
npm start
```

## First-time deployment (Amplify backend)

The frontend reads from an AppSync GraphQL API + DynamoDB table that Amplify Gen 2 provisions from [amplify/](amplify/). To set them up the first time:

1. Open the [AWS Amplify console](https://console.aws.amazon.com/amplify/) and create a new app.
2. Connect this GitHub repository and select the `main` branch.
3. Set the app root to `frontend/` so Amplify picks up `amplify/backend.ts`.
4. Confirm — Amplify runs `npx ampx pipeline-deploy` and provisions the AppSync API and DynamoDB table.
5. After the first deploy completes, download the generated `amplify_outputs.json` from the Amplify console and commit it so the GitHub Pages build can talk to the deployed backend.

Subsequent pushes to `main` redeploy the backend automatically via Amplify; the static frontend is published to GitHub Pages by the [Frontend workflow](../.github/workflows/frontend.yml).
