# Backend

AWS Lambda function that runs hourly, polls the Skånetrafiken API for delayed and cancelled journeys, and writes them to a DynamoDB table that the frontend reads from.

## Local Development

### Prerequisites

- Node.js v24+

### Setup

Install npm packages:

```shell
npm install
```

Create `.env` file with AWS credentials

```shell
cp .env.example .env
```

and fill in missing secrets.

### Start

```shell
npm run dev
```

## Automated Deployment

The backend is deployed automatically to AWS using GitHub Actions CI/CD pipeline. It is triggered on code changes within the `backend` directory on pushes or PR-merges to the `main` branch.

---

## Manual Deployment

If, for some reason there is a reason to deploy manually, it is possible to do so.

### Prerequisites

- AWS CLI
- Docker

Authenticate your Docker client to the AWS ECR (make sure to be logged in to Nermin's AWS first)

```sh
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 791739690501.dkr.ecr.eu-north-1.amazonaws.com
```

### Deploy

1. Build and tag docker image

```sh
docker build -t 791739690501.dkr.ecr.eu-north-1.amazonaws.com/nermin99/skanetrafiken-delays:latest .
```

2. Push image to AWS ECR

```sh
docker push 791739690501.dkr.ecr.eu-north-1.amazonaws.com/nermin99/skanetrafiken-delays:latest
```

3. Update lambda function to use latest image

```sh
aws lambda update-function-code \
    --function-name skanetrafiken-delays-function \
    --image-uri 791739690501.dkr.ecr.eu-north-1.amazonaws.com/nermin99/skanetrafiken-delays:latest
```

4. *Note*: Remember to delete old images in ECR if they are not needed anymore.
