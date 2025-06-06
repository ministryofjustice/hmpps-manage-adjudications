import { Readable } from 'stream'
import { Request } from 'express'
import {
  convertDateTimeStringToSubmittedDateTime,
  convertToTitleCase,
  formatReportingOfficer,
  formatLocation,
  getDate,
  getTime,
  properCase,
} from '../utils/utils'

import HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient from '../data/prisonApiClient'
import ManageAdjudicationsSystemTokensClient from '../data/manageAdjudicationsSystemTokensClient'

import PrisonerResult from '../data/prisonerResult'
import { IncidentLocation } from '../data/PrisonLocationResult'
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
  PrisonerGender,
  OffenceRule,
} from '../data/DraftAdjudicationResult'
import { SubmittedDateTime } from '../@types/template'
import { isCentralAdminCaseload, StaffSearchByName } from './userService'
import adjudicationUrls from '../utils/urlGenerator'
import { isPrisonerGenderKnown } from './prisonerSearchService'
import { ContinueReportApiFilter } from '../routes/continueReport/continueReportFilterHelper'
import { ApiPageRequest, ApiPageResponse } from '../data/ApiData'
import HmppsManageUsersClient, { User } from '../data/hmppsManageUsersClient'
import ManageAdjudicationsUserTokensClient from '../data/manageAdjudicationsUserTokensClient'
import config from '../config'
import LocationService from './locationService'

export interface PrisonerResultSummary extends PrisonerResult {
  friendlyName: string
  displayName: string
  prisonerNumber: string
  currentLocation: string
}

interface DraftAdjudicationEnhanced extends DraftAdjudication {
  displayName: string
  friendlyName: string
  formattedDiscoveryDateTime: string
}

export interface StaffSearchWithCurrentLocation extends StaffSearchByName {
  currentLocation: string
}

export type ExistingDraftIncidentDetails = {
  dateTime: SubmittedDateTime
  dateTimeOfDiscovery: SubmittedDateTime
  locationId: number // TODO: MAP-2114: remove at a later date
  locationUuid?: string
  startedByUserId: string
  chargeNumber?: string
}

export default class PlaceOnReportService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly hmppsManageUsersClient: HmppsManageUsersClient,
    private readonly locationService: LocationService
  ) {}

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

  async getPrisonerDetailsFromAdjNumber(draftId: number, user: User): Promise<PrisonerResultSummary> {
    const draftAdjudication = await this.getDraftAdjudicationDetails(draftId, user)
    return this.getPrisonerDetails(draftAdjudication.draftAdjudication.prisonerNumber, user)
  }

  async getReporterName(username: string, user: User): Promise<string> {
    const userDetails = await this.hmppsManageUsersClient.getUserFromUsername(username, user.token)
    return userDetails.name
  }

  async startNewDraftAdjudication(
    dateTimeOfIncident: string,
    locationId: number, // TODO: MAP-2114: remove at a later date
    locationUuid: string,
    prisonerNumber: string,
    user: User,
    gender: PrisonerGender,
    dateTimeOfDiscovery?: string
  ): Promise<DraftAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    const prisoner = await this.getPrisonerDetails(prisonerNumber, user)
    const requestBody = {
      dateTimeOfIncident,
      agencyId: user.meta.caseLoadId,
      locationId, // TODO: MAP-2114: remove at a later date
      locationUuid,
      prisonerNumber,
      dateTimeOfDiscovery,
      gender,
      overrideAgencyId: prisoner.agencyId !== user.meta.caseLoadId ? prisoner.agencyId : null,
      offenderBookingId: prisoner.bookingId,
    }
    return client.startNewDraftAdjudication(requestBody)
  }

  async addDraftYouthOffenderStatus(
    draftId: number,
    whichRuleChosen: string,
    removeExistingOffences: boolean,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    const requestBody = {
      isYouthOffenderRule: whichRuleChosen === 'yoi',
      removeExistingOffences,
    }

    return client.saveYouthOffenderStatus(draftId, requestBody)
  }

  async addOrUpdateDraftIncidentStatement(
    draftId: number,
    incidentStatement: string,
    completed: boolean,
    user: User
  ): Promise<DraftAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)

    const { draftAdjudication } = await client.getDraftAdjudication(draftId)
    const editRequired = Boolean(draftAdjudication?.incidentStatement != null)

    const requestBody = {
      statement: incidentStatement,
      completed,
    }
    return editRequired
      ? client.putDraftIncidentStatement(draftId, requestBody)
      : client.postDraftIncidentStatement(draftId, requestBody)
  }

  async getCheckYourAnswersInfo(draftId: number, locations: IncidentLocation[], user: User): Promise<CheckYourAnswers> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const manageAdjudicationsClient = new ManageAdjudicationsSystemTokensClient(token, user)

    const draftAdjudicationInfo = await manageAdjudicationsClient.getDraftAdjudication(draftId)
    const { draftAdjudication } = draftAdjudicationInfo
    const reporter = await this.hmppsManageUsersClient.getUserFromUsername(
      draftAdjudication.startedByUserId,
      user.token
    )

    const dateTime = draftAdjudication.incidentDetails.dateTimeOfIncident
    const date = getDate(dateTime, 'D MMMM YYYY')
    const time = getTime(dateTime)
    const dateTimeDiscovery = draftAdjudication.incidentDetails.dateTimeOfDiscovery
    const dateDiscovery = getDate(dateTimeDiscovery, 'D MMMM YYYY')
    const timeDiscovery = getTime(dateTimeDiscovery)

    const dpsLocationId = await this.locationService.getCorrespondingDpsLocationId(
      draftAdjudication.incidentDetails.locationId,
      user
    )
    const [locationObj] = locations.filter(loc => loc.locationId === dpsLocationId)

    let changeReportingOfficerLink
    let changeReportingOfficerDataQa
    if (!draftAdjudication.createdOnBehalfOfOfficer) {
      changeReportingOfficerLink = `${adjudicationUrls.createOnBehalfOf.urls.start(
        draftId
      )}?referrer=${adjudicationUrls.checkYourAnswers.urls.start(draftId)}&editSubmittedAdjudication=false`
      changeReportingOfficerDataQa = 'reporting-officer-changeLink'
    }

    const incidentDetails = [
      {
        label: 'Reporting officer',
        value: formatReportingOfficer(reporter.name, draftAdjudication),
        changeLinkHref: changeReportingOfficerLink,
        dataQa: changeReportingOfficerDataQa,
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
        value: locationObj?.userDescription || '',
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
      chargeNumber: draftAdjudication.chargeNumber,
      isYouthOffender: draftAdjudication.isYouthOffender,
    }
  }

  async getDraftIncidentDetailsForEditing(
    chargeNumber: string | number,
    user: User
  ): Promise<ExistingDraftIncidentDetails> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const manageAdjudicationsClient = new ManageAdjudicationsSystemTokensClient(token, user)
    const response = await manageAdjudicationsClient.getDraftAdjudication(chargeNumber)
    const { incidentDetails } = response.draftAdjudication
    const dateAndTimeOfIncident = await convertDateTimeStringToSubmittedDateTime(incidentDetails.dateTimeOfIncident)
    const dateAndTimeOfDiscovery = await convertDateTimeStringToSubmittedDateTime(incidentDetails.dateTimeOfDiscovery)
    return {
      dateTime: dateAndTimeOfIncident,
      locationId: incidentDetails.locationId, // TODO: MAP-2114: remove at a later date
      locationUuid: incidentDetails.locationUuid,
      startedByUserId: response.draftAdjudication.startedByUserId,
      chargeNumber: response.draftAdjudication.chargeNumber,
      dateTimeOfDiscovery: dateAndTimeOfDiscovery,
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
    location: number, // TODO: MAP-2114: remove at a later date
    locationUuid: string,
    user: User,
    dateTimeOfDiscovery: string
  ): Promise<DraftAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const manageAdjudicationsClient = new ManageAdjudicationsSystemTokensClient(token, user)
    const editedIncidentDetails = {
      dateTimeOfIncident: dateTime,
      locationId: location,
      locationUuid,
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
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const manageAdjudicationsClient = new ManageAdjudicationsSystemTokensClient(token, user)
    const editIncidentRoleRequest = {
      incidentRole: {
        roleCode,
      },
      removeExistingOffences,
    }
    const updatedAdjudication = await manageAdjudicationsClient.updateIncidentRole(id, editIncidentRoleRequest)
    return updatedAdjudication
  }

  async completeDraftAdjudication(id: number, user: User): Promise<string> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const manageAdjudicationsClient = new ManageAdjudicationsSystemTokensClient(token, user)
    const completedAdjudication = await manageAdjudicationsClient.submitCompleteDraftAdjudication(id)
    return completedAdjudication.chargeNumber
  }

  async getDraftAdjudicationDetails(draftId: number, user: User): Promise<DraftAdjudicationResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const manageAdjudicationsClient = new ManageAdjudicationsSystemTokensClient(token, user)
    return manageAdjudicationsClient.getDraftAdjudication(draftId)
  }

  async getAllDraftAdjudicationsForUser(
    user: User,
    filter: ContinueReportApiFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<DraftAdjudicationEnhanced>> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const pageResponse = await new ManageAdjudicationsSystemTokensClient(token, user).getAllDraftAdjudicationsForUser(
      filter,
      pageRequest
    )

    const prisonerDetails = new Map(
      (
        await new PrisonApiClient(user.token).getBatchPrisonerDetails(
          pageResponse.content.map(report => report.prisonerNumber)
        )
      ).map(prisonerDetail => [prisonerDetail.offenderNo, prisonerDetail])
    )

    const getEnhancedReportsByUser = (draftAdjudication: DraftAdjudication) => {
      const prisoner = prisonerDetails.get(draftAdjudication.prisonerNumber)
      const displayName = convertToTitleCase(`${prisoner.lastName}, ${prisoner.firstName}`)
      const friendlyName = convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`)
      const formattedDiscoveryDateTime = getDate(
        draftAdjudication.incidentDetails.dateTimeOfDiscovery,
        'D MMMM YYYY - HH:mm'
      )

      return { ...draftAdjudication, displayName, friendlyName, formattedDiscoveryDateTime }
    }

    return this.mapData(pageResponse, draftAdjudication => {
      const enhanced = getEnhancedReportsByUser(draftAdjudication)
      return {
        ...enhanced,
      }
    })
  }

  mapData<TI, TO>(data: ApiPageResponse<TI>, transform: (input: TI) => TO): ApiPageResponse<TO> {
    return {
      ...data,
      content: data.content.map(transform),
    }
  }

  async getInfoForTaskListStatuses(draftId: number, user: User): Promise<TaskListDetails> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const manageAdjudicationsClient = new ManageAdjudicationsSystemTokensClient(token, user)
    const { draftAdjudication } = await manageAdjudicationsClient.getDraftAdjudication(draftId)

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

  checkOffenceDetails(offenceDetails: OffenceDetails): boolean {
    if (!offenceDetails) return false
    return Object.keys(offenceDetails).length > 0
  }

  getNextOffencesUrl(offenceDetails: OffenceDetails, draftId: number): string {
    const offenceDetailsComplete = this.checkOffenceDetails(offenceDetails)
    if (offenceDetailsComplete) return adjudicationUrls.detailsOfOffence.urls.start(draftId)
    return adjudicationUrls.ageOfPrisoner.urls.start(draftId)
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

  async getOffencePrisonerDetails(draftId: number, user: User) {
    const draftAdjudication = await this.getDraftAdjudicationDetails(draftId, user)
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

  async getPrisonerNumberFromDraftChargeNumber(draftId: number, user: User) {
    const draftAdjudication = await this.getDraftAdjudicationDetails(draftId, user)
    const prisonerDetails = await this.getPrisonerDetails(draftAdjudication.draftAdjudication.prisonerNumber, user)
    return prisonerDetails.prisonerNumber
  }

  async getOffenceRule(offenceCode: number, isYouthOffender: boolean, gender: PrisonerGender, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.getOffenceRule(offenceCode, isYouthOffender, gender)
  }

  getAllOffenceRules = async (isYouthOffender: boolean, gender: PrisonerGender, user: User): Promise<OffenceRule[]> => {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.getAllOffenceRules(isYouthOffender, gender, +config.offenceVersion)
  }

  async saveOffenceDetails(draftId: number, offenceDetails: OffenceDetails, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.saveOffenceDetails(draftId, offenceDetails)
  }

  async aloAmendOffenceDetails(draftId: number, offenceDetails: OffenceDetails, user: User) {
    const client = new ManageAdjudicationsUserTokensClient(user)
    return client.aloAmendOffenceDetails(draftId, offenceDetails)
  }

  async saveAssociatedPrisoner(draftId: number, associatedPrisoner: AssociatedPrisoner, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.saveAssociatedPrisoner(draftId, associatedPrisoner)
  }

  async saveDamageDetails(chargeNumber: string, damageDetails: DamageDetails[], user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.saveDamageDetails(chargeNumber, damageDetails)
  }

  async saveEvidenceDetails(chargeNumber: string, evidenceDetails: EvidenceDetails[], user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.saveEvidenceDetails(chargeNumber, evidenceDetails)
  }

  async saveWitnessDetails(chargeNumber: string, witnessDetails: WitnessDetails[], user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.saveWitnessDetails(chargeNumber, witnessDetails)
  }

  async amendPrisonerGender(draftId: number, chosenGender: PrisonerGender, user: User) {
    const genderData = {
      gender: chosenGender,
    }
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.amendGender(draftId, genderData)
  }

  async setCreatedOnBehalfOf(
    chargeNumber: string,
    createdOnBehalfOfOfficer: string,
    createdOnBehalfOfReason: string,
    user: User
  ) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.setCreatedOnBehalfOf(chargeNumber, createdOnBehalfOfOfficer, createdOnBehalfOfReason)
  }

  async setDraftCreatedOnBehalfOf(
    draftId: number,
    createdOnBehalfOfOfficer: string,
    createdOnBehalfOfReason: string,
    user: User
  ) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const client = new ManageAdjudicationsSystemTokensClient(token, user)
    return client.setDraftCreatedOnBehalfOf(draftId, createdOnBehalfOfOfficer, createdOnBehalfOfReason)
  }

  setPrisonerGenderOnSession(req: Request, prisonerNumber: string, genderSelected: string) {
    // @ts-expect-error: No index signature with a parameter of type 'string' was found on type 'Session & Partial<SessionData>'.ts(7053)
    req.session[prisonerNumber] = { gender: genderSelected }
  }

  getPrisonerGenderFromSession(req: Request) {
    return req.session[req.params.prisonerNumber as keyof typeof req.session]?.gender
  }

  getAndDeletePrisonerGenderFromSession(req: Request) {
    const chosenGender = this.getPrisonerGenderFromSession(req)
    delete req.session[req.params.prisonerNumber as keyof typeof req.session]?.gender
    return chosenGender
  }

  async getGenderDataForTable(
    draftCreationPath: boolean,
    prisoner: PrisonerResultSummary,
    draftAdjudication: DraftAdjudication
  ) {
    const isPrisonerGenderKnownOnProfile = isPrisonerGenderKnown(prisoner.physicalAttributes.gender)
    if (!isPrisonerGenderKnownOnProfile && draftCreationPath) {
      return {
        data: [
          {
            label: 'What is the gender of the prisoner?',
            value: properCase(draftAdjudication.gender),
          },
        ],
        changeLinkHref: draftCreationPath
          ? adjudicationUrls.selectGender.url.edit(prisoner.prisonerNumber, draftAdjudication.id)
          : null,
      }
    }
    return null
  }

  async removeDraftAdjudication(draftAdjudicationId: number, user: User): Promise<void> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new ManageAdjudicationsSystemTokensClient(token, user).removeDraftAdjudication(draftAdjudicationId)
  }
}
