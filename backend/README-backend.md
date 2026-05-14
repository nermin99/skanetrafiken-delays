# Backend

AWS Lambda function that runs hourly, polls the Skånetrafiken API for delayed and cancelled journeys, and writes them to a DynamoDB table that the frontend reads from.

## Prerequisites

- Node.js v24+
- AWS CLI
- Docker (for deployment)

## Local development

Set up `.env` file with AWS credentials:

```shell
cp .env.example .env
```

Install dependencies and run the script:

```shell
npm install
npm run dev
```
