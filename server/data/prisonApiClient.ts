import config from '../config'
import RestClient from './restClient'

export interface CaseLoad {
  caseLoadId: string
  description: string
  type: string
  caseloadFunction: string
  currentlyActive: boolean
}

export default class PrisonApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prison, token)
  }

  getUserCaseLoads(): Promise<CaseLoad[]> {
    return this.restClient.get<CaseLoad[]>({ path: '/api/users/me/caseLoads' })
  }
}
