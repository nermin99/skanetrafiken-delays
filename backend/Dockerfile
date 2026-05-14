FROM public.ecr.aws/lambda/nodejs:22

COPY package*.json ${LAMBDA_TASK_ROOT}/

RUN npm ci

COPY tsconfig.json ${LAMBDA_TASK_ROOT}/
COPY src/ ${LAMBDA_TASK_ROOT}/src/

RUN npm run build

RUN npm prune --production

CMD [ "dist/index.handler" ]
