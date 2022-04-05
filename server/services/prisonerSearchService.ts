import { Readable } from 'stream'
import type { PrisonerSearchByName, PrisonerSearchByPrisonerNumber } from '../data/prisonerSearchClient'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchResult from '../data/prisonerSearchResult'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { convertToTitleCase } from '../utils/utils'
import { incidentDetails } from '../utils/urlGenerator'

export interface PrisonerSearchSummary extends PrisonerSearchResult {
  displayName: string
  friendlyName: string
  displayCellLocation: string
  incidentDetailsUrl: string
}

// Anything with a number is considered not to be a name, so therefore an identifier (prison no, PNC no etc.)
export const isPrisonerIdentifier = (searchTerm: string): boolean => /\d/.test(searchTerm)

function searchByName(searchTerm: string, prisonIds: string[]): PrisonerSearchByName {
  const [lastName, firstName] = searchTerm.split(' ')
  return { lastName, firstName, prisonIds }
}

function searchByPrisonerIdentifier(searchTerm: string, prisonIds: string[]): PrisonerSearchByPrisonerNumber {
  return { prisonerIdentifier: searchTerm.toUpperCase(), prisonIds }
}

export interface PrisonerSearch {
  prisonIds: string[]
  searchTerm: string
}

export default class PrisonerSearchService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private static enhancePrisoner(prisoner: PrisonerSearchResult) {
    return {
      displayName: convertToTitleCase(`${prisoner.lastName}, ${prisoner.firstName}`),
      friendlyName: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      displayCellLocation: prisoner.cellLocation?.replace('CSWAP', 'No cell allocated') || 'None',
    }
  }

  async search(search: PrisonerSearch, user: User): Promise<PrisonerSearchSummary[]> {
    const searchTerm = search.searchTerm.replace(/,/g, ' ').replace(/\s\s+/g, ' ').trim()
    const { prisonIds } = search

    const searchRequest = isPrisonerIdentifier(searchTerm)
      ? searchByPrisonerIdentifier(searchTerm, prisonIds)
      : searchByName(searchTerm, prisonIds)

    const results = await new PrisonerSearchClient(user.token).search(searchRequest)

    const enhancedResults = results.map(prisoner => {
      return {
        ...prisoner,
        ...PrisonerSearchService.enhancePrisoner(prisoner),
        incidentDetailsUrl: incidentDetails.urls.start(prisoner.prisonerNumber),
      }
    })

    return enhancedResults.sort((a: PrisonerSearchSummary, b: PrisonerSearchSummary) =>
      a.displayName.localeCompare(b.displayName)
    )
  }

  async getPrisonerImage(prisonerNumber: string, user: User): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new PrisonApiClient(token).getPrisonerImage(prisonerNumber)
  }
}
