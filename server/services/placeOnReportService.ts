import { Readable } from 'stream'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import LocationService from './locationService'
import { PrisonLocation, IncidentLocation } from '../data/PrisonLocationResult'

import { convertToTitleCase, formatLocation, getTime, getDate } from '../utils/utils'
import PrisonerResult from '../data/prisonerResult'
import { DraftAdjudicationResult, CheckYourAnswers } from '../data/DraftAdjudicationResult'

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
      currentLocation: formatLocation(prisoner.assignedLivingUnit.description),
    }

    return enhancedResult
  }

  async startNewDraftAdjudication(
    dateTimeOfIncident: string,
    locationId: number,
    prisonerNumber: string,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const client = new ManageAdjudicationsClient(user.token)
    const requestBody = {
      dateTimeOfIncident,
      locationId,
      prisonerNumber,
    }
    return client.startNewDraftAdjudication(requestBody)
  }

  async postDraftIncidentStatement(
    id: number,
    incidentStatement: string,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const client = new ManageAdjudicationsClient(user.token)
    const requestBody = {
      statement: incidentStatement,
    }
    return client.postDraftIncidentStatement(id, requestBody)
  }

  async getCheckYourAnswersInfo(
    id: number,
    incidentLocations: IncidentLocation[],
    user: User
  ): Promise<CheckYourAnswers> {
    const client = new ManageAdjudicationsClient(user.token)

    const [draftAdjudicationInfo] = await Promise.all([client.getDraftAdjudication(id)])
    const { draftAdjudication } = draftAdjudicationInfo

    const dateTime = draftAdjudication.incidentDetails.dateTimeOfIncident
    const date = getDate(dateTime, 'D MMMM YYYY')
    const time = getTime(dateTime)

    const [locationObj] = incidentLocations.filter(
      loc => loc.locationId === draftAdjudication.incidentDetails.locationId
    )

    const incidentDetails = [
      {
        label: 'Reporting Officer',
        value: user.name,
      },
      {
        label: 'Date',
        value: date,
      },
      {
        label: 'Time',
        value: time,
      },
      {
        label: 'Location',
        value: locationObj.userDescription,
      },
    ]

    return {
      incidentDetails,
      statement: draftAdjudication.incidentStatement.statement,
    }
  }
}
