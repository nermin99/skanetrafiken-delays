# Skånetrafiken Delays

Did the train you were on get delayed, but you can't remember which one it was? Or maybe it's winter and you can't even remember the last time the trains were not delayed? Fear no more, because [skanetrafiken-delays.se](https://skanetrafiken-delays.se/) keeps track of all delayed trains across the Öresund strait for you, both in real time and historically, so you can look back at past delays, patterns, and just how optimistic the timetable really was.

## Developing

The frontend reads delay data from a DynamoDB table via an AppSync GraphQL API, both provisioned by [AWS Amplify Gen 2](https://docs.amplify.aws/) (see [amplify/data/resource.ts](amplify/data/resource.ts)).
### Local development

In one terminal, start the Amplify sandbox, which provisions a personal copy of the backend and writes `amplify_outputs.json`:

```shell
npx ampx sandbox
```

In another, start the dev server:

```shell
npm start
```

### Deployment

Run the following to build and deploy the site to github pages

```shell
npm run deploy
```
