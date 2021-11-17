import { Readable } from 'stream'

import { convertToTitleCase, formatLocation, getDate, getFormattedReporterName, getTime } from '../utils/utils'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'

import PrisonerResult from '../data/prisonerResult'
import { PrisonLocation } from '../data/PrisonLocationResult'
import { DraftAdjudicationResult, CheckYourAnswers, DraftAdjudication } from '../data/DraftAdjudicationResult'
import { SubmittedDateTime } from '../@types/template'

export interface PrisonerResultSummary extends PrisonerResult {
  friendlyName: string
  displayName: string
  prisonerNumber: string
  currentLocation: string
}

interface DraftAdjudicationEnhanced extends DraftAdjudication {
  displayName: string
  friendlyName: string
  incidentDate: string
  incidentTime: string
}

type ExistingDraftIncidentDetails = {
  dateTime: SubmittedDateTime
  locationId: number
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

  async addOrUpdateDraftIncidentStatement(
    id: number,
    incidentStatement: string,
    completed: boolean,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const client = new ManageAdjudicationsClient(user.token)

    const { draftAdjudication } = await client.getDraftAdjudication(id)
    const editRequired = Boolean(draftAdjudication?.incidentStatement != null)

    const requestBody = {
      statement: incidentStatement,
      completed,
    }
    return editRequired
      ? client.putDraftIncidentStatement(id, requestBody)
      : client.postDraftIncidentStatement(id, requestBody)
  }

  async getCheckYourAnswersInfo(id: number, locations: PrisonLocation[], user: User): Promise<CheckYourAnswers> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)

    const draftAdjudicationInfo = await manageAdjudicationsClient.getDraftAdjudication(id)
    const { draftAdjudication } = draftAdjudicationInfo
    const reporter = await this.hmppsAuthClient.getUserFromUsername(draftAdjudication.createdByUserId, user.token)

    const dateTime = draftAdjudication.incidentDetails.dateTimeOfIncident
    const date = getDate(dateTime, 'D MMMM YYYY')
    const time = getTime(dateTime)

    const [locationObj] = locations.filter(loc => loc.locationId === draftAdjudication.incidentDetails.locationId)

    const formatStatement = (statement: string) => {
      if (!statement) return null
      const statementArray = statement.split(/\r|\n/)
      return statementArray
        .map(paragraph => {
          return `<p class='govuk-body'>${paragraph}</p>`
        })
        .join('')
    }

    const incidentDetails = [
      {
        label: 'Reporting Officer',
        value: getFormattedReporterName(reporter.name),
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
      statement: formatStatement(draftAdjudication.incidentStatement.statement),
    }
  }

  async getDraftIncidentDetailsForEditing(id: number, user: User): Promise<ExistingDraftIncidentDetails> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const response = await manageAdjudicationsClient.getDraftAdjudication(id)
    const { incidentDetails } = response.draftAdjudication
    const date = getDate(incidentDetails.dateTimeOfIncident, 'DD/MM/YYYY')
    const time = getTime(incidentDetails.dateTimeOfIncident)
    const hour = time.split(':')[0]
    const minute = time.split(':')[1]
    return { dateTime: { date, time: { hour, minute } }, locationId: incidentDetails.locationId }
  }

  async editDraftIncidentDetails(
    id: number,
    dateTime: string,
    location: number,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const editedIncidentDetails = {
      dateTimeOfIncident: dateTime,
      locationId: location,
    }

    const editedAdjudication = await manageAdjudicationsClient.editDraftIncidentDetails(id, editedIncidentDetails)
    return editedAdjudication
  }

  async completeDraftAdjudication(id: number, user: User): Promise<number> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const completedAdjudication = await manageAdjudicationsClient.submitCompleteDraftAdjudication(id)
    return completedAdjudication.adjudicationNumber
  }

  async getDraftAdjudicationDetails(id: number, user: User): Promise<DraftAdjudicationResult> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    return manageAdjudicationsClient.getDraftAdjudication(id)
  }

  async getAllDraftAdjudicationsForUser(user: User): Promise<DraftAdjudicationEnhanced[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const allAdjudications = await new ManageAdjudicationsClient(token).getAllDraftAdjudicationsForUser()

    const enhanceReport = async (authToken: string, report: DraftAdjudication) => {
      const prisoner = await new PrisonApiClient(authToken).getPrisonerDetails(report.prisonerNumber)
      const displayName = convertToTitleCase(`${prisoner.lastName}, ${prisoner.firstName}`)
      const friendlyName = convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`)
      const incidentDate = getDate(report.incidentDetails.dateTimeOfIncident, 'D MMMM YYYY')
      const incidentTime = getTime(report.incidentDetails.dateTimeOfIncident)
      return { ...report, displayName, friendlyName, incidentDate, incidentTime }
    }

    const getEnhancedReportsByUser = async () => {
      return Promise.all(
        allAdjudications.draftAdjudications.map((report: DraftAdjudication) => enhanceReport(token, report))
      )
    }

    return getEnhancedReportsByUser().then(reportsByUser =>
      reportsByUser.sort((a: DraftAdjudicationEnhanced, b: DraftAdjudicationEnhanced) =>
        a.displayName.localeCompare(b.displayName)
      )
    )
  }
}
