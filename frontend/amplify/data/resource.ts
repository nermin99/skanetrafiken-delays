import { a, defineData, type ClientSchema } from '@aws-amplify/backend'

const schema = a.schema({
  Delay: a
    .model({
      routeId: a.string().required(),
      date: a.string().required(),
      time: a.string().required(),
      trainNumber: a.string().required(),
      origin: a.string().required(),
      destination: a.string().required(),
      delayMinutes: a.integer().required(),
    })
    .secondaryIndexes((idx) => [
      idx('routeId').sortKeys(['date']).queryField('listDelaysByRouteAndDate'),
    ])
    .authorization((allow) => [allow.publicApiKey().to(['read'])]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
})
