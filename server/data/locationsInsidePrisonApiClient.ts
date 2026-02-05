import config from '../config'
import RestClient from './restClient'

import { LocationsApiLocation } from './PrisonLocationResult'

export default class LocationsInsidePrisonApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Locations inside prison API', config.apis.locationsInsidePrison, token)
  }

  async getLocation(id: string): Promise<LocationsApiLocation> {
    return this.restClient.get({
      path: `/locations/${id}?formatLocalName=true`,
    })
  }

  async getLocations(prisonId: string): Promise<LocationsApiLocation[]> {
    return this.getLocationsByServiceType(prisonId, 'LOCATION_OF_INCIDENT')
  }

  async getAdjudicationLocations(prisonId: string): Promise<LocationsApiLocation[]> {
    return this.getLocationsByServiceType(prisonId, 'HEARING_LOCATION')
  }

  private getLocationsByServiceType(prisonId: string, serviceType: string): Promise<LocationsApiLocation[]> {
    return this.restClient.get({
      path: `/locations/non-residential/prison/${prisonId}/service/${serviceType}?formatLocalName=true&sortByLocalName=true`,
    })
  }
}
