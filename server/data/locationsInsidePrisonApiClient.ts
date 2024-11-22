import config from '../config'
import RestClient from './restClient'

import { LocationsApiLocation } from './PrisonLocationResult'

export default class LocationsInsidePrisonApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Locations inside prison API', config.apis.locationsInsidePrison, token)
  }

  async getLocations(prisonId: string): Promise<LocationsApiLocation[]> {
    return this.restClient.get({
      path: `/locations/prison/${prisonId}/non-residential-usage-type/OCCURRENCE?formatLocalName=true&sortByLocalName=true`,
    })
  }

  async getLocation(id: string): Promise<LocationsApiLocation> {
    return this.restClient.get({
      path: `/locations/${id}?formatLocalName=true`,
    })
  }

  async getAdjudicationLocations(prisonId: string): Promise<LocationsApiLocation[]> {
    return this.restClient.get({
      path: `/locations/prison/${prisonId}/location-type/ADJUDICATION_ROOM?formatLocalName=true&sortByLocalName=true`,
    })
  }
}
