import { plainToClass } from 'class-transformer'
import config from '../config'
import RestClient from './restClient'
import PrisonerSearchResult from './prisonerSearchResult'

export interface PrisonerSearchByPrisonerNumber {
  prisonerIdentifier: string
  prisonIds?: string[]
  includeAliases?: boolean
}

export interface PrisonerSearchByName {
  firstName: string
  lastName: string
  prisonIds?: string[]
  includeAliases?: boolean
}

type PrisonerSearchRequest = PrisonerSearchByPrisonerNumber | PrisonerSearchByName

export default class PrisonerSearchClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prisoner Search', config.apis.prisonerSearch, token)
  }

  async search(searchRequest: PrisonerSearchRequest): Promise<PrisonerSearchResult[]> {
    const results = await this.restClient.post<PrisonerSearchResult[]>({
      path: `/prisoner-search/match-prisoners`,
      data: {
        includeAliases: false,
        ...searchRequest,
      },
    })

    return results.map(result => plainToClass(PrisonerSearchResult, result, { excludeExtraneousValues: true }))
  }

  async getPrisonerDetails(prisonerNumber: string): Promise<PrisonerSearchResult> {
    return await this.restClient.get<PrisonerSearchResult>({
      path: `/prisoner/${prisonerNumber}`,
    })
  }
}
