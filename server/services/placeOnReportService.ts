import { Readable } from 'stream'

import { convertToTitleCase, formatLocation, getDate, getFormattedReporterName, getTime } from '../utils/utils'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'

import PrisonerResult from '../data/prisonerResult'
import { PrisonLocation } from '../data/PrisonLocationResult'
import {
  DraftAdjudicationResult,
  CheckYourAnswers,
  DraftAdjudication,
  TaskListDetails,
  OffenceDetails,
} from '../data/DraftAdjudicationResult'
import { SubmittedDateTime } from '../@types/template'
import { isCentralAdminCaseload, StaffSearchByName } from './userService'

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

export interface StaffSearchWithCurrentLocation extends StaffSearchByName {
  currentLocation: string
}

export type ExistingDraftIncidentDetails = {
  dateTime: SubmittedDateTime
  locationId: number
  startedByUserId: string
  adjudicationNumber?: number
  incidentRole?: { associatedPrisonersNumber: string; roleCode: string }
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

  async getPrisonerDetailsFromAdjNumber(adjudicationNumber: number, user: User): Promise<PrisonerResultSummary> {
    const draftAdjudication = await this.getDraftAdjudicationDetails(adjudicationNumber, user)
    return this.getPrisonerDetails(draftAdjudication.draftAdjudication.prisonerNumber, user)
  }

  async getReporterName(username: string, user: User): Promise<string> {
    const userDetails = await this.hmppsAuthClient.getUserFromUsername(username, user.token)
    return userDetails.name
  }

  async startNewDraftAdjudication(
    dateTimeOfIncident: string,
    locationId: number,
    prisonerNumber: string,
    associatedPrisonersNumber: string,
    roleCode: string,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const client = new ManageAdjudicationsClient(user.token)
    const requestBody = {
      dateTimeOfIncident,
      agencyId: user.activeCaseLoadId,
      locationId,
      prisonerNumber,
      incidentRole: {
        roleCode,
        associatedPrisonersNumber,
      },
    }
    return client.startNewDraftAdjudication(requestBody)
  }

  async addDraftYouthOffenderStatus(
    adjudicationNumber: number,
    whichRuleChosen: string,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const client = new ManageAdjudicationsClient(user.token)
    const requestBody = {
      isYouthOffenderRule: whichRuleChosen === 'yoi',
    }

    return client.saveYouthOffenderStatus(adjudicationNumber, requestBody)
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
    const reporter = await this.hmppsAuthClient.getUserFromUsername(draftAdjudication.startedByUserId, user.token)

    const dateTime = draftAdjudication.incidentDetails.dateTimeOfIncident
    const date = getDate(dateTime, 'D MMMM YYYY')
    const time = getTime(dateTime)

    const [locationObj] = locations.filter(loc => loc.locationId === draftAdjudication.incidentDetails.locationId)

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
      statement: draftAdjudication.incidentStatement?.statement,
      adjudicationNumber: draftAdjudication.adjudicationNumber,
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
    return {
      dateTime: { date, time: { hour, minute } },
      locationId: incidentDetails.locationId,
      startedByUserId: response.draftAdjudication.startedByUserId,
      adjudicationNumber: response.draftAdjudication.adjudicationNumber,
      incidentRole: {
        associatedPrisonersNumber: response.draftAdjudication.incidentRole.associatedPrisonersNumber,
        roleCode: response.draftAdjudication.incidentRole.roleCode,
      },
    }
  }

  async editDraftIncidentDetails(
    id: number,
    dateTime: string,
    location: number,
    associatedPrisonersNumber: string,
    roleCode: string,
    removeExistingOffences: boolean,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const editedIncidentDetails = {
      dateTimeOfIncident: dateTime,
      locationId: location,
      incidentRole: {
        associatedPrisonersNumber,
        roleCode,
      },
      removeExistingOffences,
    }
    const editedAdjudication = await manageAdjudicationsClient.editDraftIncidentDetails(id, editedIncidentDetails)
    return editedAdjudication
  }

  async updateDraftIncidentRole(
    id: number,
    associatedPrisonersNumber: string,
    roleCode: string,
    removeExistingOffences: boolean,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const editIncidentRoleRequest = {
      incidentRole: {
        associatedPrisonersNumber,
        roleCode,
      },
      removeExistingOffences,
    }
    const updatedAdjudication = await manageAdjudicationsClient.updateIncidentRole(id, editIncidentRoleRequest)
    return updatedAdjudication
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
    const allAdjudications = await new ManageAdjudicationsClient(token).getAllDraftAdjudicationsForUser(
      user.activeCaseLoadId
    )

    const prisonerDetails = new Map(
      (
        await new PrisonApiClient(user.token).getBatchPrisonerDetails(
          allAdjudications.draftAdjudications.map(report => report.prisonerNumber)
        )
      ).map(prisonerDetail => [prisonerDetail.offenderNo, prisonerDetail])
    )

    const getEnhancedReportsByUser = async () => {
      return allAdjudications.draftAdjudications.map(report => {
        const prisoner = prisonerDetails.get(report.prisonerNumber)
        const displayName = convertToTitleCase(`${prisoner.lastName}, ${prisoner.firstName}`)
        const friendlyName = convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`)
        const incidentDate = getDate(report.incidentDetails.dateTimeOfIncident, 'D MMMM YYYY')
        const incidentTime = getTime(report.incidentDetails.dateTimeOfIncident)
        return { ...report, displayName, friendlyName, incidentDate, incidentTime }
      })
    }

    return getEnhancedReportsByUser().then(reportsByUser =>
      reportsByUser.sort((a: DraftAdjudicationEnhanced, b: DraftAdjudicationEnhanced) =>
        a.displayName.localeCompare(b.displayName)
      )
    )
  }

  async getInfoForTaskListStatuses(draftAdjudicationId: number, user: User): Promise<TaskListDetails> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const { draftAdjudication } = await manageAdjudicationsClient.getDraftAdjudication(draftAdjudicationId)

    return {
      handoverDeadline: draftAdjudication.incidentDetails.handoverDeadline,
      statementPresent: !!draftAdjudication.incidentStatement,
      statementComplete: draftAdjudication.incidentStatement?.completed || false,
      offenceDetailsComplete: draftAdjudication.offenceDetails?.length > 0,
    }
  }

  async getAssociatedStaffDetails(
    staffMembers: StaffSearchByName[],
    user: User
  ): Promise<StaffSearchWithCurrentLocation[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)

    const agencyIds = [...new Set(staffMembers.map(person => person.activeCaseLoadId))]

    const getLocationName = async (agencyId: string) => {
      if (isCentralAdminCaseload(agencyId)) return { agencyId, locationFullName: 'Central Admin' }

      const locationName = await new PrisonApiClient(token).getAgency(agencyId)
      return { agencyId, locationFullName: locationName?.description }
    }

    const locations = await Promise.all(agencyIds.map((agencyId: string) => getLocationName(agencyId)))

    return Promise.all(
      staffMembers.map((staffMember: StaffSearchByName) => {
        const currentLocation = locations.find(location => location.agencyId === staffMember.activeCaseLoadId)
        return { ...staffMember, currentLocation: currentLocation.locationFullName }
      })
    )
  }

  async getOffencePrisonerDetails(adjudicationNumber: number, user: User) {
    const draftAdjudication = await this.getDraftAdjudicationDetails(adjudicationNumber, user)
    const { prisonerNumber } = draftAdjudication.draftAdjudication
    const associatedPrisonerNumber = draftAdjudication.draftAdjudication?.incidentRole?.associatedPrisonersNumber
    const [prisoner, associatedPrisoner] = await Promise.all([
      this.getPrisonerDetails(prisonerNumber, user),
      associatedPrisonerNumber && this.getPrisonerDetails(associatedPrisonerNumber, user),
    ])
    return {
      prisoner,
      associatedPrisoner,
    }
  }

  async getPrisonerNumberFromDraftAdjudicationNumber(adjudicationNumber: number, user: User) {
    const draftAdjudication = await this.getDraftAdjudicationDetails(adjudicationNumber, user)
    const prisonerDetails = await this.getPrisonerDetails(draftAdjudication.draftAdjudication.prisonerNumber, user)
    return prisonerDetails.prisonerNumber
  }

  async getOffenceRule(offenceCode: number, isYouthOffender: boolean, user: User) {
    const client = new ManageAdjudicationsClient(user.token)
    return client.getOffenceRule(offenceCode, isYouthOffender)
  }

  async saveOffenceDetails(adjudicationNumber: number, offenceDetails: OffenceDetails[], user: User) {
    const client = new ManageAdjudicationsClient(user.token)
    return client.saveOffenceDetails(adjudicationNumber, offenceDetails)
  }
}
