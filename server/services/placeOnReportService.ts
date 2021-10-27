import { Readable } from 'stream'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'

import convertToTitleCase from '../utils/utils'
import PrisonerResult from '../data/prisonerResult'

export interface PrisonerResultSummary extends PrisonerResult {
  friendlyName: string
  displayName: string
  prisonerNumber: string
  currentLocation: string
}

export default class PlaceOnReportService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getPrisonerImage(prisonerNumber: string, user: User): Promise<Readable> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new PrisonApiClient(token).getPrisonerImage(prisonerNumber)
  }

  async getPrisonerDetails(prisonerNumber: string, user: User): Promise<PrisonerResultSummary> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const prisoner = await new PrisonApiClient(token).getPrisonerDetails(prisonerNumber)

    const enhancedResult = {
      ...prisoner,
      friendlyName: convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`),
      displayName: convertToTitleCase(`${prisoner.lastName}, ${prisoner.firstName}`),
      prisonerNumber: prisoner.offenderNo,
      currentLocation: prisoner.assignedLivingUnit.agencyName,
    }

    return enhancedResult
  }
}
