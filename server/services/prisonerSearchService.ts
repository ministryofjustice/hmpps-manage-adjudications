import { Readable } from 'stream'
import type { PrisonerSearchByName, PrisonerSearchByPrisonerNumber } from '../data/prisonerSearchClient'
import PrisonerSearchClient from '../data/prisonerSearchClient'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchResult from '../data/prisonerSearchResult'
import HmppsAuthClient from '../data/hmppsAuthClient'
import { convertToTitleCase } from '../utils/utils'
import { PrisonerGender } from '../data/DraftAdjudicationResult'
import adjudicationUrls from '../utils/urlGenerator'
import { User } from '../data/hmppsManageUsersClient'
import { Alert } from '../utils/alertHelper'

export interface PrisonerSearchSummary extends PrisonerSearchResult {
  displayName: string
  friendlyName: string
  displayCellLocation: string
  startHref: string
  prisonName: string
  onlyShowPrisonName: boolean
}

export type PrisonerSearchDetailsDis5 = {
  currentIncentiveLevel?: string
  dateTimeOfLevel?: string
  nextReviewDate?: string
  autoReleaseDate?: string
  conditionalReleaseDate?: string
  imprisonmentStatus?: string
  sentenceStartDate?: string
  alerts?: Alert[]
  acctAlertPresent?: boolean
  csipAlertPresent?: boolean
}

// Anything with a number is considered not to be a name, so therefore an identifier (prison no, PNC no etc.)
export const isPrisonerIdentifier = (searchTerm: string): boolean => /\d/.test(searchTerm)

export const isPrisonerGenderKnown = (prisonerGender: string): boolean => {
  if (!prisonerGender) return false
  const gender = prisonerGender.toUpperCase()
  return gender === PrisonerGender.FEMALE || gender === PrisonerGender.MALE
}

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
      startHref: this.getPrisonerStartHref(prisoner),
    }
  }

  private static getPrisonerStartHref(prisoner: PrisonerSearchResult) {
    const prisonerGender = prisoner.gender?.toUpperCase()
    if (isPrisonerGenderKnown(prisonerGender)) {
      return adjudicationUrls.incidentDetails.urls.start(prisoner.prisonerNumber)
    }
    return adjudicationUrls.selectGender.url.start(prisoner.prisonerNumber)
  }

  private static activeAcctAlertPresent(alerts: Alert[]) {
    const acctAlert = alerts.filter(alert => alert.alertCode === 'HA')
    return acctAlert.length && acctAlert[0].active
  }

  private static activeCsipAlertPresent(alerts: Alert[]) {
    const csipAlert = alerts.filter(alert => alert.alertCode === 'CSIP')
    return csipAlert.length && csipAlert[0].active
  }

  async search(search: PrisonerSearch, user: User): Promise<PrisonerSearchSummary[]> {
    const searchTerm = search.searchTerm.replace(/,/g, ' ').replace(/\s\s+/g, ' ').trim()
    const { prisonIds } = search

    const searchRequest = isPrisonerIdentifier(searchTerm)
      ? searchByPrisonerIdentifier(searchTerm, prisonIds)
      : searchByName(searchTerm, prisonIds)
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)

    const results = await new PrisonerSearchClient(token).search(searchRequest)
    const enhancedResults = results.map(prisoner => {
      return {
        ...prisoner,
        onlyShowPrisonName: prisoner.prisonId !== user.meta.caseLoadId,
        ...PrisonerSearchService.enhancePrisoner(prisoner),
      }
    })

    return enhancedResults.sort((a: PrisonerSearchSummary, b: PrisonerSearchSummary) =>
      a.displayName.localeCompare(b.displayName)
    )
  }

  async isPrisonerNumberValid(prisonerNumber: string, user: User): Promise<boolean> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    try {
      const result = await new PrisonerSearchClient(token).getPrisonerDetails(prisonerNumber)
      return result && !!result.prisonerNumber
    } catch (err) {
      if (err.status === 404) {
        // Expected
        return false
      }
      throw err
    }
  }

  async getPrisonerDetailsForDis5(prisonerNumber: string, user: User): Promise<PrisonerSearchDetailsDis5> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const prisonerDetails = await new PrisonerSearchClient(token).getPrisonerDetails(prisonerNumber)
    return {
      currentIncentiveLevel: prisonerDetails.currentIncentive.level.description || null,
      dateTimeOfLevel: prisonerDetails.currentIncentive.dateTime || null,
      nextReviewDate: prisonerDetails.currentIncentive.nextReviewDate || null,
      autoReleaseDate: prisonerDetails.automaticReleaseDate || null,
      conditionalReleaseDate: prisonerDetails.conditionalReleaseDate || null,
      sentenceStartDate: prisonerDetails.sentenceStartDate || null,
      acctAlertPresent: PrisonerSearchService.activeAcctAlertPresent(prisonerDetails.alerts) || null,
      csipAlertPresent: PrisonerSearchService.activeCsipAlertPresent(prisonerDetails.alerts) || null,
    }
  }

  async getPrisonerImage(prisonerNumber: string, user: User): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new PrisonApiClient(token).getPrisonerImage(prisonerNumber)
  }
}
