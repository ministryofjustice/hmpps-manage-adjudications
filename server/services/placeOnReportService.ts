import { Readable } from 'stream'

import { convertToTitleCase, formatLocation, getDate, getFormattedOfficerName, getTime } from '../utils/utils'

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
  IncidentStatementStatus,
  AssociatedPrisoner,
  DamageDetails,
  EvidenceDetails,
  WitnessDetails,
  AdjudicationSectionStatus,
} from '../data/DraftAdjudicationResult'
import { SubmittedDateTime } from '../@types/template'
import { isCentralAdminCaseload, StaffSearchByName } from './userService'
import adjudicationUrls from '../utils/urlGenerator'

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
  dateTimeOfDiscovery: SubmittedDateTime
  locationId: number
  startedByUserId: string
  adjudicationNumber?: number
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
    user: User,
    dateTimeOfDiscovery?: string
  ): Promise<DraftAdjudicationResult> {
    const client = new ManageAdjudicationsClient(user.token)
    const requestBody = {
      dateTimeOfIncident,
      agencyId: user.activeCaseLoadId,
      locationId,
      prisonerNumber,
      dateTimeOfDiscovery,
    }
    return client.startNewDraftAdjudication(requestBody)
  }

  async addDraftYouthOffenderStatus(
    adjudicationNumber: number,
    whichRuleChosen: string,
    removeExistingOffences: boolean,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const client = new ManageAdjudicationsClient(user.token)
    const requestBody = {
      isYouthOffenderRule: whichRuleChosen === 'yoi',
      removeExistingOffences,
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
    const dateTimeDiscovery = draftAdjudication.incidentDetails.dateTimeOfDiscovery
    const dateDiscovery = getDate(dateTimeDiscovery, 'D MMMM YYYY')
    const timeDiscovery = getTime(dateTimeDiscovery)

    const [locationObj] = locations.filter(loc => loc.locationId === draftAdjudication.incidentDetails.locationId)

    const incidentDetails = [
      {
        label: 'Reporting Officer',
        value: getFormattedOfficerName(reporter.name),
      },
      {
        label: 'Date of incident',
        value: date,
      },
      {
        label: 'Time of incident',
        value: time,
      },
      {
        label: 'Location',
        value: locationObj.userDescription,
      },
      {
        label: 'Date of discovery',
        value: dateDiscovery,
      },
      {
        label: 'Time of discovery',
        value: timeDiscovery,
      },
    ]

    return {
      incidentDetails,
      statement: draftAdjudication.incidentStatement?.statement,
      adjudicationNumber: draftAdjudication.adjudicationNumber,
      isYouthOffender: draftAdjudication.isYouthOffender,
    }
  }

  async getDraftIncidentDetailsForEditing(id: number, user: User): Promise<ExistingDraftIncidentDetails> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const response = await manageAdjudicationsClient.getDraftAdjudication(id)
    const { incidentDetails } = response.draftAdjudication
    return {
      dateTime: this.convertDate(incidentDetails.dateTimeOfIncident),
      locationId: incidentDetails.locationId,
      startedByUserId: response.draftAdjudication.startedByUserId,
      adjudicationNumber: response.draftAdjudication.adjudicationNumber,
      dateTimeOfDiscovery: this.convertDate(incidentDetails.dateTimeOfDiscovery),
    }
  }

  convertDate = (aDate: string) => {
    const date = getDate(aDate, 'DD/MM/YYYY')
    const time = getTime(aDate)
    const hour = time.split(':')[0]
    const minute = time.split(':')[1]

    return { date, time: { hour, minute } }
  }

  async editDraftIncidentDetails(
    id: number,
    dateTime: string,
    location: number,
    user: User,
    dateTimeOfDiscovery: string
  ): Promise<DraftAdjudicationResult> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const editedIncidentDetails = {
      dateTimeOfIncident: dateTime,
      locationId: location,
      // TODO - Make this optional in API!
      removeExistingOffences: false,
      dateTimeOfDiscovery,
    }
    const editedAdjudication = await manageAdjudicationsClient.editDraftIncidentDetails(id, editedIncidentDetails)
    return editedAdjudication
  }

  async updateDraftIncidentRole(
    id: number,
    roleCode: string,
    removeExistingOffences: boolean,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const manageAdjudicationsClient = new ManageAdjudicationsClient(user.token)
    const editIncidentRoleRequest = {
      incidentRole: {
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

    const statementComplete = draftAdjudication.incidentStatement?.completed || false
    const offenceDetailsComplete = this.checkOffenceDetails(draftAdjudication.offenceDetails)
    const offenceDetailsStatus = this.getStatus(offenceDetailsComplete)

    const offenceDetailsUrl = this.getNextOffencesUrl(draftAdjudication.offenceDetails, draftAdjudication.id)
    const incidentStatementStatus = this.getIncidentStatementStatus(
      !!draftAdjudication.incidentStatement,
      statementComplete
    )
    const damagesStatus = this.getStatus(draftAdjudication.damagesSaved)
    const evidenceStatus = this.getStatus(draftAdjudication.evidenceSaved)
    const witnessesStatus = this.getStatus(draftAdjudication.witnessesSaved)

    return {
      offenceDetailsUrl,
      handoverDeadline: draftAdjudication.incidentDetails.handoverDeadline,
      incidentStatementStatus,
      offenceDetailsStatus,
      showLinkForAcceptDetails: offenceDetailsComplete && statementComplete,
      damagesStatus,
      evidenceStatus,
      witnessesStatus,
    }
  }

  checkOffenceDetails(offenceDetails: OffenceDetails[]): boolean {
    return offenceDetails?.length > 0 || false
  }

  getNextOffencesUrl(offenceDetails: OffenceDetails[], adjudicationId: number): string {
    const offenceDetailsComplete = this.checkOffenceDetails(offenceDetails)
    if (offenceDetailsComplete) return adjudicationUrls.detailsOfOffence.urls.start(adjudicationId)
    return adjudicationUrls.ageOfPrisoner.urls.start(adjudicationId)
  }

  getIncidentStatementStatus = (statementPresent: boolean, statementComplete: boolean): IncidentStatementStatus => {
    if (!statementPresent) return { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' }
    if (statementComplete) return { classes: 'govuk-tag', text: 'COMPLETED' }
    return { classes: 'govuk-tag govuk-tag--blue', text: 'IN PROGRESS' }
  }

  getStatus = (adjudicationsSectionCompleted: boolean): AdjudicationSectionStatus => {
    if (adjudicationsSectionCompleted) return { classes: 'govuk-tag', text: 'COMPLETED' }
    return { classes: 'govuk-tag govuk-tag--grey', text: 'NOT STARTED' }
  }

  async getAssociatedStaffDetails(
    staffMembers: StaffSearchByName[],
    user: User
  ): Promise<StaffSearchWithCurrentLocation[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const activeStaffMembers = staffMembers.filter(person => !!person.activeCaseLoadId)

    const agencyIds = [...new Set(activeStaffMembers.map(person => person.activeCaseLoadId))]

    const getLocationName = async (agencyId: string) => {
      if (isCentralAdminCaseload(agencyId)) return { agencyId, locationFullName: 'Central Admin' }

      const locationName = await new PrisonApiClient(token).getAgency(agencyId)
      return { agencyId, locationFullName: locationName?.description }
    }

    const locations = await Promise.all(agencyIds.map((agencyId: string) => getLocationName(agencyId)))

    return Promise.all(
      activeStaffMembers.map((staffMember: StaffSearchByName) => {
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

  async saveAssociatedPrisoner(adjudicationNumber: number, associatedPrisoner: AssociatedPrisoner, user: User) {
    const client = new ManageAdjudicationsClient(user.token)
    return client.saveAssociatedPrisoner(adjudicationNumber, associatedPrisoner)
  }

  async saveDamageDetails(adjudicationNumber: number, damageDetails: DamageDetails[], user: User) {
    const client = new ManageAdjudicationsClient(user.token)
    return client.saveDamageDetails(adjudicationNumber, damageDetails)
  }

  async saveEvidenceDetails(adjudicationNumber: number, evidenceDetails: EvidenceDetails[], user: User) {
    const client = new ManageAdjudicationsClient(user.token)
    return client.saveEvidenceDetails(adjudicationNumber, evidenceDetails)
  }

  async saveWitnessDetails(adjudicationNumber: number, witnessDetails: WitnessDetails[], user: User) {
    const client = new ManageAdjudicationsClient(user.token)
    return client.saveWitnessDetails(adjudicationNumber, witnessDetails)
  }
}
