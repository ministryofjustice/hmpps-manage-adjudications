import config from '../config'
import {
  DraftAdjudicationResult,
  IncidentStatement,
  IncidentDetails,
  EditedIncidentDetails,
  EditIncidentRoleRequest,
  OffenceRule,
  OffenceDetails,
  ApplicableRules,
  AssociatedPrisoner,
  DamageDetails,
  EvidenceDetails,
  WitnessDetails,
  PrisonerGender,
  DraftAdjudication,
} from './DraftAdjudicationResult'
import {
  ReportedAdjudicationResult,
  ReportedAdjudication,
  ReportedAdjudicationDISFormFilter,
  ReportedAdjudicationsResult,
  allIssueStatuses,
  ReportedAdjudicationFilter,
  allStatuses,
  ScheduledHearingList,
  AdjudicationHistoryFilter,
} from './ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from './ApiData'
import RestClient from './restClient'
import { momentDateToApi } from '../utils/utils'
import { ContinueReportApiFilter } from '../routes/continueReport/continueReportFilterHelper'
import { ActivePunishment, PunishmentData, PunishmentDataWithSchedule, SuspendedPunishment } from './PunishmentResult'
import { User } from './hmppsManageUsersClient'
import { Balances, DamageObligation } from './prisonApiClient'

export interface IncidentDetailsEnhanced extends IncidentDetails {
  prisonerNumber: string
  agencyId: string
  overrideAgencyId?: string
  gender: PrisonerGender
}

export type AgencyReportCounts = {
  reviewTotal: number
  transferReviewTotal: number
  transferOutTotal: number
  transferAllTotal: number
  hearingsToScheduleTotal: number
}

export type ConsecutiveAdditionalDaysReport = {
  chargeNumber: string
  chargeProvedDate: string
  punishment: PunishmentDataWithSchedule
}

export type LastReportedOffence = {
  chargeNumber: string
  dateOfIncident: string
  dateOfDiscovery: string
  statement: string
  punishments: PunishmentData[]
}

export type ChargesWithSuspendedPunishments = {
  dateOfIncident: string
  dateOfDiscovery: string
  chargeNumber: string
  suspendedPunishments: SuspendedPunishment[]
}

export type Dis5PrintSupport = {
  chargeNumber: string
  dateOfIncident: string
  dateOfDiscovery: string
  previousCount: number
  previousAtCurrentEstablishmentCount: number
  sameOffenceCount: number
  lastReportedOffence?: LastReportedOffence
  chargesWithSuspendedPunishments: ChargesWithSuspendedPunishments[]
  existingPunishments: PunishmentData[]
}

export interface Dis5AdjudicationsAndMoneyPrintSupport extends Dis5PrintSupport {
  damageObligations?: DamageObligation[]
  balances?: Balances
}

export default class ManageAdjudicationsSystemTokensClient {
  restClient: RestClient

  constructor(token: string, user: User, activeCaseLoadId: string = user.meta.caseLoadId) {
    this.restClient = new RestClient('Manage Adjudications API', config.apis.adjudications, token, activeCaseLoadId)
  }

  async startNewDraftAdjudication(incidentDetails: IncidentDetailsEnhanced): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/draft-adjudications`,
      data: { ...incidentDetails },
    })
  }

  async postDraftIncidentStatement(
    draftId: number,
    incidentStatement: IncidentStatement
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/draft-adjudications/${draftId}/incident-statement`,
      data: { ...incidentStatement },
    })
  }

  async putDraftIncidentStatement(
    draftId: number,
    incidentStatement: IncidentStatement
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${draftId}/incident-statement`,
      data: { ...incidentStatement },
    })
  }

  async getDraftAdjudication(chargeNumber: string | number): Promise<DraftAdjudicationResult> {
    return this.restClient.get({
      path: `/draft-adjudications/${chargeNumber}`,
    })
  }

  async getAllDraftAdjudicationsForUser(
    filter: ContinueReportApiFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<DraftAdjudication>> {
    const path =
      `/draft-adjudications/my-reports?page=${pageRequest.number}&size=${pageRequest.size}` +
      `${(filter.fromDate && `&startDate=${momentDateToApi(filter.fromDate)}`) || ''}` +
      `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}`

    return this.restClient.get({
      path,
    })
  }

  async submitCompleteDraftAdjudication(id: number): Promise<ReportedAdjudication> {
    return this.restClient.post({
      path: `/draft-adjudications/${id}/complete-draft-adjudication`,
    })
  }

  async editDraftIncidentDetails(
    id: number,
    editedIncidentDetails: EditedIncidentDetails
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${id}/incident-details`,
      data: { ...editedIncidentDetails },
    })
  }

  async updateIncidentRole(
    id: number,
    editIncidentRoleRequest: EditIncidentRoleRequest
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${id}/incident-role`,
      data: { ...editIncidentRoleRequest },
    })
  }

  async getReportedAdjudication(chargeNumber: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.get({
      path: `/reported-adjudications/${chargeNumber}/v2`,
    })
  }

  private getCompletedAdjudications =
    (prefix: string) =>
    async (
      filter: ReportedAdjudicationFilter,
      pageRequest: ApiPageRequest
    ): Promise<ApiPageResponse<ReportedAdjudication>> => {
      const path =
        `${prefix}?page=${pageRequest.number}&size=${pageRequest.size}` +
        `${(filter.fromDate && `&startDate=${momentDateToApi(filter.fromDate)}`) || ''}` +
        `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}` +
        `${(filter.status && `&status=${filter.status}`) || `&status=${allStatuses}`}`
      return this.restClient.get({
        path,
      })
    }

  getYourCompletedAdjudications = this.getCompletedAdjudications('/reported-adjudications/my-reports')

  async getReportedAdjudicationIssueData(
    filter: ReportedAdjudicationDISFormFilter
  ): Promise<ReportedAdjudicationsResult> {
    const path =
      `/reported-adjudications/for-issue/v2?` +
      `${(filter.fromDate && `startDate=${momentDateToApi(filter.fromDate)}`) || ''}` +
      `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}`
    return this.restClient.get({
      path,
    })
  }

  async getReportedAdjudicationPrintData(
    filter: ReportedAdjudicationDISFormFilter
  ): Promise<ReportedAdjudicationsResult> {
    const path =
      `/reported-adjudications/for-print?${
        (filter.fromDate && `startDate=${momentDateToApi(filter.fromDate)}`) || ''
      }` +
      `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}` +
      `${(filter.issueStatus && `&issueStatus=${filter.issueStatus}`) || `&issueStatus=${allIssueStatuses}`}`
    return this.restClient.get({
      path,
    })
  }

  async createDraftFromCompleteAdjudication(chargeNumber: string): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/create-draft-adjudication`,
    })
  }

  async getOffenceRule(offenceCode: number, isYouthOffender: boolean, gender: PrisonerGender): Promise<OffenceRule> {
    return this.restClient.get({
      path: `/draft-adjudications/offence-rule/${offenceCode}?youthOffender=${isYouthOffender}&gender=${gender}`,
    })
  }

  async getAllOffenceRules(isYouthOffender: boolean, gender: PrisonerGender): Promise<OffenceRule[]> {
    return this.restClient.get({
      path: `/draft-adjudications/offence-rules?youthOffender=${isYouthOffender}&gender=${gender}`,
    })
  }

  async saveOffenceDetails(draftId: number, offenceDetails: OffenceDetails) {
    return this.restClient.put({
      path: `/draft-adjudications/${draftId}/offence-details`,
      data: { offenceDetails },
    })
  }

  async saveYouthOffenderStatus(
    draftId: number,
    applicableRulesData: ApplicableRules
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${draftId}/applicable-rules`,
      data: applicableRulesData,
    })
  }

  async saveAssociatedPrisoner(
    draftId: number,
    associatedPrisoner: AssociatedPrisoner
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${draftId}/associated-prisoner`,
      data: associatedPrisoner,
    })
  }

  async saveDamageDetails(chargeNumber: string, damages: DamageDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${chargeNumber}/damages`,
      data: { damages },
    })
  }

  async updateDamageDetails(chargeNumber: string, damages: DamageDetails[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/damages/edit`,
      data: { damages },
    })
  }

  async saveEvidenceDetails(chargeNumber: string, evidence: EvidenceDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${chargeNumber}/evidence`,
      data: { evidence },
    })
  }

  async updateEvidenceDetails(chargeNumber: string, evidence: EvidenceDetails[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/evidence/edit`,
      data: { evidence },
    })
  }

  async saveWitnessDetails(chargeNumber: string, witnesses: WitnessDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${chargeNumber}/witnesses`,
      data: { witnesses },
    })
  }

  async updateWitnessDetails(chargeNumber: string, witnesses: WitnessDetails[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/witnesses/edit`,
      data: { witnesses },
    })
  }

  async amendGender(draftId: number, chosenGender: { gender: PrisonerGender }): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${draftId}/gender`,
      data: { ...chosenGender },
    })
  }

  async setCreatedOnBehalfOf(
    chargeNumber: string,
    createdOnBehalfOfOfficer: string,
    createdOnBehalfOfReason: string
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/created-on-behalf-of`,
      data: {
        createdOnBehalfOfOfficer,
        createdOnBehalfOfReason,
      },
    })
  }

  async setDraftCreatedOnBehalfOf(
    draftId: number,
    createdOnBehalfOfOfficer: string,
    createdOnBehalfOfReason: string
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${draftId}/created-on-behalf-of`,
      data: {
        createdOnBehalfOfOfficer,
        createdOnBehalfOfReason,
      },
    })
  }

  async putDateTimeOfIssue(chargeNumber: string, dateTimeOfIssue: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/issue`,
      data: { dateTimeOfIssue },
    })
  }

  async removeDraftAdjudication(draftAdjudicationId: number): Promise<void> {
    return this.restClient.delete({
      path: `/draft-adjudications/${draftAdjudicationId}`,
    })
  }

  async getAgencyReportCounts(): Promise<AgencyReportCounts> {
    return this.restClient.get({
      path: `/reported-adjudications/report-counts`,
    })
  }

  async getHearingsGivenAgencyAndDate(chosenHearingDate: string): Promise<ScheduledHearingList> {
    return this.restClient.get({
      path: `/reported-adjudications/hearings?hearingDate=${chosenHearingDate}`,
    })
  }

  async getPrisonerAdjudicationHistory(
    bookingId: number,
    filter: AdjudicationHistoryFilter,
    allAgencies: Array<string>,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<ReportedAdjudication>> {
    const path =
      `/reported-adjudications/booking/${bookingId}?page=${pageRequest.number}&size=${pageRequest.size}` +
      `${(filter.status && `&status=${filter.status}`) || `&status=${allStatuses}`}` +
      `${(filter.fromDate && `&startDate=${momentDateToApi(filter.fromDate)}`) || ''}` +
      `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}` +
      `${(filter.agency && `&agency=${filter.agency}`) || `&agency=${allAgencies}`}` +
      `${(filter.ada && `&ada=true`) || ''}` +
      `${(filter.pada && `&pada=true`) || ''}` +
      `${(filter.suspended && `&suspended=true`) || ''}`

    return this.restClient.get({
      path,
    })
  }

  async getPrisonerAdjudicationHistoryAllBookings(
    prisonerNumber: string,
    filter: AdjudicationHistoryFilter,
    pageRequest: ApiPageRequest
  ): Promise<ApiPageResponse<ReportedAdjudication>> {
    const path =
      `/reported-adjudications/bookings/prisoner/${prisonerNumber}?page=${pageRequest.number}&size=${pageRequest.size}` +
      `${(filter.status && `&status=${filter.status}`) || `&status=${allStatuses}`}` +
      `${(filter.fromDate && `&startDate=${momentDateToApi(filter.fromDate)}`) || ''}` +
      `${(filter.toDate && `&endDate=${momentDateToApi(filter.toDate)}`) || ''}` +
      `${(filter.ada && `&ada=true`) || ''}` +
      `${(filter.pada && `&pada=true`) || ''}` +
      `${(filter.suspended && `&suspended=true`) || ''}`
    return this.restClient.get({
      path,
    })
  }

  async getPrisonerActiveAdjudications(bookingId: number): Promise<ActivePunishment[]> {
    return this.restClient.get({
      path: `/reported-adjudications/punishments/${bookingId}/active`,
    })
  }

  async getDataForDis5(chargeNumber: string): Promise<Dis5PrintSupport> {
    return this.restClient.get({
      path: `/reported-adjudications/${chargeNumber}/print-support/dis5`,
    })
  }
}
