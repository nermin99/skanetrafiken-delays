# Replace mock data with real DynamoDB data via AWS Amplify Gen 2

## Context

`skanetrafiken-delays` previously rendered **algorithmically generated** mock delay records from `src/data/mockApi.ts`. The function `fetchDelays(query)` seeded a PRNG by `(station pair, day)` and returned synthetic `DelayRecord[]`. It was consumed via [src/hooks/useDelays.ts](src/hooks/useDelays.ts) → [src/App.tsx:39](src/App.tsx#L39).

A populated DynamoDB table already exists outside Amplify, fed by an external scraper. The goal: replace `fetchDelays` with a typed call to an AppSync GraphQL API backed by a new Amplify-managed DynamoDB table, with **public anonymous access** (API key), keeping **GitHub Pages** as the frontend host. The data is re-imported into the new table; the scraper is updated to write into it going forward (scraper changes live elsewhere — out of scope for this repo).

## Existing DynamoDB schema (source data)

| Existing column | Type | Example | Purpose |
| --- | --- | --- | --- |
| `date` (PK) | String | `2026-04-29` | Partition key |
| `datetime` (SK?) | String | `2026-04-29T22:01:12.705` | Per-row uniqueness |
| `1_applyTime` | String | `20:41` | Departure time, HH:mm |
| `2_totalDelay` | Number | `62` | Delay in minutes |
| `3_fromStation` | String | `CPH Airport Kastrup` | Origin |
| `4_toStation` | String | `Malmö Hyllie` | Destination |
| `5_trainNr` | Number | `1146` | Train number |
| `6_isCancelled` | Boolean | `true` | Cancellation flag |
| `7_fromTime` | String | `2026-04-29T20:41:00Z` | Scheduled departure (ISO) |
| `8_toTime` | String | `2026-04-29T20:53:00Z` | Scheduled arrival (ISO) |

The numeric-prefixed field names and `date`-only partition key are artifacts of the existing scraper and are not preserved in the new schema. `isCancelled` / `fromTime` / `toTime` are intentionally not modeled in Amplify — the UI doesn't use them and they can be added later.

## Approach

Use **Amplify Gen 2 + Data** (code-first TypeScript). Define a `Delay` model in `amplify/data/resource.ts` with a secondary index on `(routeId, date)` for efficient route-and-date-range queries; provision via `npx ampx sandbox` (dev) or `pipeline-deploy` (prod) to create the DynamoDB table + AppSync API + public API key. Commit the resulting `amplify_outputs.json` so GitHub Pages builds bundle the endpoint + key. Replace `fetchDelays` with `client.models.Delay.listDelaysByRouteAndDate(...)` via `generateClient<Schema>()`. Re-import existing rows after transforming column names and types.

API-key auth is acceptable here because the traffic is public/anonymous and the key ends up in the bundle regardless. Rate-limiting and quotas are configured on the AppSync API key.

## File changes (implemented)

### New: Amplify backend

- [amplify/backend.ts](amplify/backend.ts) — `defineBackend({ data })`
- [amplify/data/resource.ts](amplify/data/resource.ts) — schema + auth modes
- [amplify/package.json](amplify/package.json) — `{"type": "module"}` so `ampx` resolves TS files
- [amplify/tsconfig.json](amplify/tsconfig.json) — Amplify Gen 2 tsconfig

### Schema ([amplify/data/resource.ts](amplify/data/resource.ts))

```ts
import { a, defineData, type ClientSchema } from '@aws-amplify/backend'

const schema = a.schema({
  Delay: a
    .model({
      routeId: a.string().required(),       // `${origin}->${destination}`
      date: a.string().required(),          // yyyy-mm-dd
      time: a.string().required(),          // HH:mm
      trainNumber: a.string().required(),   // string, not number
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
```

### Frontend changes

- [package.json](package.json) — added runtime dep `aws-amplify`, devDeps `@aws-amplify/backend` and `@aws-amplify/backend-cli`.
- [src/main.tsx](src/main.tsx) — configures Amplify at boot (see snippet below).
- `src/data/mockApi.ts` **deleted**; replaced by [src/data/delaysApi.ts](src/data/delaysApi.ts) (see snippet below).
- [src/hooks/useDelays.ts:3](src/hooks/useDelays.ts#L3) — import updated: `'../data/mockApi'` → `'../data/delaysApi'`.
- [src/data/stations.ts](src/data/stations.ts) — expanded from 2 to **10 stations** (canonical source of truth, see snippet below).
- [.gitignore](.gitignore) — added `.amplify/` (Amplify CLI workspace). `amplify_outputs.json` is intentionally **not** ignored — it must be committed for GitHub Pages builds.

`src/main.tsx`:

```ts
import { Amplify } from 'aws-amplify'
import amplifyOutputs from '../amplify_outputs.json'
Amplify.configure(amplifyOutputs)
```

`src/data/delaysApi.ts`:

```ts
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import type { DelayQuery, DelayRecord, Station } from '../types'
import { rangeForQuery } from '../lib/dates'

const client = generateClient<Schema>()

export async function fetchDelays(query: DelayQuery): Promise<DelayRecord[]> {
  if (query.stationA === query.stationB) return []
  const { start, end } = rangeForQuery(query)
  const routeId = `${query.stationA}->${query.stationB}`
  const { data, errors } = await client.models.Delay.listDelaysByRouteAndDate({
    routeId,
    date: { between: [start, end] },
  })
  if (errors?.length) throw new Error(errors.map((e) => e.message).join('; '))
  return data.map((d) => ({
    id: d.id,
    date: d.date,
    time: d.time,
    trainNumber: d.trainNumber,
    origin: d.origin as Station,
    destination: d.destination as Station,
    delayMinutes: d.delayMinutes,
  }))
}
```

`src/data/stations.ts`:

```ts
export const STATIONS = [
  'Burlöv',
  'Malmö C',
  'Malmö Triangeln',
  'Malmö Hyllie',
  'CPH Airport Kastrup',
  'Tårnby',
  'Ørestad',
  'Köpenhamn H',
  'Köpenhamn Nørreport',
  'Köpenhamn Østerport',
] as const
```

The `Station` type, `STATIONS` constant, and the picker dropdown all derive from this. The `App.tsx` default pair (`Malmö C` ↔ `Köpenhamn H`) is unchanged.

### Unchanged

- [src/types.ts](src/types.ts) — `DelayRecord`, `DelayQuery` shapes preserved; `Station` automatically widens via `stations.ts`.
- [src/lib/dates.ts](src/lib/dates.ts) — `rangeForQuery` reused as-is.
- [vite.config.ts](vite.config.ts) — no changes.

## Row shape required in the new table

Every row written to the new Amplify table (via re-import or the updated scraper) must look like:

```json
{
  "routeId": "CPH Airport Kastrup->Malmö Hyllie",
  "date": "2026-04-29",
  "time": "20:41",
  "trainNumber": "1146",
  "origin": "CPH Airport Kastrup",
  "destination": "Malmö Hyllie",
  "delayMinutes": 62
}
```

Plus Amplify auto-assigned `id` (UUID), `createdAt`, `updatedAt`, `__typename: "Delay"`.

### Translation from existing DynamoDB rows

| New field | Existing source | Notes |
| --- | --- | --- |
| `routeId` | computed | `` `${3_fromStation}->${4_toStation}` `` |
| `date` | `date` | already `yyyy-mm-dd` |
| `time` | `1_applyTime` | already `HH:mm` |
| `trainNumber` | `5_trainNr` | **must be coerced to string** (`String(item['5_trainNr'])`) |
| `origin` | `3_fromStation` | |
| `destination` | `4_toStation` | |
| `delayMinutes` | `2_totalDelay` | must be an integer |

The `datetime`, `6_isCancelled`, `7_fromTime`, `8_toTime` columns are dropped during import. If you later want a "cancelled" indicator or scheduled times in the UI, add them to the schema and re-run the migration.

## Setup steps remaining

1. **AWS credentials** — `aws configure` (if not already done). The IAM user/role needs to create AppSync, DynamoDB, Lambda, IAM resources. See the [Amplify docs](https://docs.amplify.aws/react/start/account-setup/) for the recommended least-privilege policy.
2. **Provision the backend** — `npx ampx sandbox`. First run takes ~3–5 min; creates the new DynamoDB table + AppSync API + API key and writes `amplify_outputs.json` to the repo root. Leave it running during development.
3. **Re-import data** — scan the old table, transform each row per the table above, `BatchWriteItem` into the new table (name visible via `npx ampx info` or AWS Console → DynamoDB → look for `Delay-…`). Skip rows where `6_isCancelled === true` if desired, or keep them — the UI doesn't distinguish.
4. **Update the scraper** (lives elsewhere) — change the destination table to the new one and emit the new field names (`routeId`, `date`, `time`, `trainNumber`, `origin`, `destination`, `delayMinutes`). Without this step, the new table only ever holds the one-time import.
5. **Production deploy** — `npx ampx pipeline-deploy --branch main --app-id <id>` produces a stable, non-sandbox `amplify_outputs.json`. Commit that file, then `npm run deploy` publishes to GitHub Pages.

## Verification

1. **Local dev** — `npx ampx sandbox` in one terminal, `npm start` in another. The default Malmö C ↔ Köpenhamn H view should hit AppSync (visible in DevTools network as POST to `*.appsync-api.*.amazonaws.com`). With an empty table, the UI should show the "no delays" state without errors.
2. **Schema correctness** — insert a known row (`routeId=Malmö C->Köpenhamn H, date=<today>, delayMinutes=42`) via the AppSync console's GraphQL playground (`createDelay` mutation), then confirm it appears in the UI for that day.
3. **Multi-station** — switch the dropdown to other station pairs that have re-imported data; confirm rows render.
4. **Type safety** — `npm run typecheck` passes; `npm run build` succeeds once `amplify_outputs.json` exists.
5. **Production** — `npm run deploy`, open the public GitHub Pages URL, confirm data loads using the committed production `amplify_outputs.json`.

## Out of scope

- The Skånetrafiken scraper (lives elsewhere)
- Modeling `isCancelled` / scheduled times in the UI (additive; can be added later)
- Switching frontend hosting from GitHub Pages to Amplify Hosting
- Authentication / user accounts
- Pagination of >1 MB result sets — DynamoDB returns a single page up to 1 MB; add `nextToken` handling later if any single route+month query exceeds it (~5–8 k rows at typical row size)
