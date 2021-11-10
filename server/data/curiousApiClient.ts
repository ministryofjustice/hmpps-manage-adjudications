import config from '../config'
import RestClient from './restClient'

export default class CuriousApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Curious API', config.apis.curious, token)
  }

  async getLearnerProfiles(prisonerNumber: string): Promise<LearnerProfile[]> {
    return this.restClient.get({
      path: `/learnerProfile/${prisonerNumber}`,
    })
  }
}
