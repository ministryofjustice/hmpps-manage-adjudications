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

  describe('locations api ', () => {
    const locations: nock.Body = []
    it('getLocations should return data from api', async () => {
      fakeLocationsInsidePrisonApi
        .get('/locations/prison/MDI/non-residential-usage-type/OCCURRENCE?formatLocalName=true&sortByLocalName=true')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, locations)

      const output = await client.getLocations('MDI')
      expect(output).toEqual(locations)
    })

    it('getLocation should return data from api', async () => {
      const location: nock.Body = {}
      fakeLocationsInsidePrisonApi
        .get('/locations/MDI?formatLocalName=true')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, location)

      const output = await client.getLocation('MDI')
      expect(output).toEqual(location)
    })

    it('getAdjudicationLocations should return data from api', async () => {
      fakeLocationsInsidePrisonApi
        .get('/locations/prison/MDI/location-type/ADJUDICATION_ROOM?formatLocalName=true&sortByLocalName=true')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, locations)

      const output = await client.getAdjudicationLocations('MDI')
      expect(output).toEqual(locations)
    })
  })
})
