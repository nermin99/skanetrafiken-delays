import type { JourneyResponse } from '../src/types/api'
const { findEligibleDelayedJourneys } = require('../src/index')

const BASE_NEGATIVE = '../skanetrafiken-api/example-responses/negative/'
const BASE_POSITIVE = '../skanetrafiken-api/example-responses/positive/'

const negatives = [
    '1-ontime.json',
    '2-delayed-ontime.json',
    '3-canceled-ontime.json',
    '4-delayed-delayed-ontime.json',
    '5-canceled-canceled-ontime.json',
    '6-delayed-canceled-ontime.json',
    '7-canceled-delayed-ontime.json',
]

const positives = [
    '1-delayed-delayed-delayed.json',
    '2-canceled-canceled-canceled.json',
    '3-delayed-delayed-canceled.json',
    '4-delayed-canceled-delayed.json',
    '5-delayed-canceled-canceled.json',
    '6-canceled-delayed-canceled.json',
    '7-canceled-canceled-delayed.json',
    '8-canceled-delayed-delayed.json',
    '9-multiple-delayed.json',
]

describe('Testing negative scenarios', () => {
    negatives.forEach((fileName) => {
        test(fileName, () => {
            const response: JourneyResponse = require(BASE_NEGATIVE + fileName)
            expect(findEligibleDelayedJourneys(response.journeys)).toStrictEqual([])
        })
    })
})

describe('Testing positive scenarios', () => {
    positives.forEach((fileName) => {
        test(fileName, () => {
            const response: JourneyResponse = require(BASE_POSITIVE + fileName)
            expect(findEligibleDelayedJourneys(response.journeys).length).toBeGreaterThan(0)
        })
    })

    const multipleDelayed = '9-multiple-delayed.json'
    test(multipleDelayed, () => {
        const response: JourneyResponse = require(BASE_POSITIVE + multipleDelayed)
        expect(findEligibleDelayedJourneys(response.journeys).length).toBe(2)
    })
})
