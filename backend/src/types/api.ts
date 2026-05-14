export interface JourneyResponse {
  api: string
  time: string
  usedSearchTime: string
  refreshRateSeconds: number
  id: string
  prevCursor: string
  nextCursor: string
  tooLongWalkJourneys: any[]
  journeys: Journey[]
}

export interface Journey {
  id: number
  sequenceNo: number
  noOfChanges: number
  deviationTag?: DeviationTag
  deviationTags?: DeviationTag[]
  routeLinks: RouteLink[]
  transportMode: string
}

interface RouteLink {
  id: string
  from: Stop
  to: Stop
  line: Line
  deviations: Deviation[]
  path: string
  operatingDayDate: string
}

interface Stop {
  name: string
  time: string
  deviation?: number
  pos: string
  stopPointCoordinate?: Coordinate
  passed: boolean
  coordinate: Coordinate
  id2: string
  timePoint: boolean
}

interface Line {
  name: string
  type: string
  no: string
  lineNo: number
  lineNoString: string
  color: string
  outlineColor: string
  iconColor: string
  towards: string
  runNo: number
  subType: string
  occupancySupport: boolean
  operatorId: string
  operatorName: string
  gid: string
}

interface DeviationTag {
  text: string
  prio: number
}

interface Deviation {
  text: string
  prio: number
  infoLinks: any[]
}

interface Coordinate {
  lat: number
  lon: number
}
