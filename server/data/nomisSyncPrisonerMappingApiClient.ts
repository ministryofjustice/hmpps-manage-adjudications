import config from '../config'
import RestClient from './restClient'
import { NomisSyncMapLocation } from './PrisonLocationResult'

export default class NomisSyncPrisonerMappingApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Nomis sync prisoner mapping API', config.apis.nomisSyncPrisonerMapping, token)
  }

  async getDpsLocationId(nomisLocationId: number): Promise<NomisSyncMapLocation> {
    return this.restClient.get({
      path: `/mapping/locations/nomis/${nomisLocationId}`,
    })
  }

  async getNomisLocationId(dpsLocationId: string): Promise<NomisSyncMapLocation> {
    return this.restClient.get({
      path: `/mapping/locations/dps/${dpsLocationId}`,
    })
  }
}
