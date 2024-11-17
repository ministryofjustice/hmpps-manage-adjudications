import nock from 'nock'
import config from '../config'
import LocationsInsidePrisonApiClient from './locationsInsidePrisonApiClient'

jest.mock('../../logger')

describe('locationInsidePrisonApiClient', () => {
  let fakeLocationsInsidePrisonApi: nock.Scope
  let client: LocationsInsidePrisonApiClient

  const token = 'token-1'

  beforeEach(() => {
    fakeLocationsInsidePrisonApi = nock(config.apis.locationsInsidePrison.url)
    client = new LocationsInsidePrisonApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getLocations', () => {
    const locations: nock.Body = []
    it('should return data from api', async () => {
      fakeLocationsInsidePrisonApi
        .get('/locations/prison/MDI/non-residential-usage-type/OCCURRENCE')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, locations)

      const output = await client.getLocations('MDI')
      expect(output).toEqual(locations)
    })
  })

  describe('getAdjudicationLocations', () => {
    const locations: nock.Body = []
    it('should return data from api', async () => {
      fakeLocationsInsidePrisonApi
        .get('/locations/prison/MDI/location-type/ADJUDICATION_ROOM')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, locations)

      const output = await client.getAdjudicationLocations('MDI')
      expect(output).toEqual(locations)
    })
  })
})
