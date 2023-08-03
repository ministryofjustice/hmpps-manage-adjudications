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
  ReportedAdjudicationResultV2,
  ReportedAdjudication,
  ReportedAdjudicationFilter,
  ReviewAdjudication,
  ScheduledHearingList,
  allStatuses,
  ReportedAdjudicationDISFormFilter,
  ReportedAdjudicationsResult,
  allIssueStatuses,
  ReportedAdjudicationStatus,
} from './ReportedAdjudicationResult'
import { ApiPageRequest, ApiPageResponse } from './ApiData'
import RestClient from './restClient'
import { momentDateToApi } from '../utils/utils'
import { ContinueReportApiFilter } from '../routes/continueReport/continueReportFilterHelper'
import {
  HearingDetails,
  HearingOutcomeAdjournReason,
  HearingOutcomeDetails,
  HearingOutcomePlea,
  NotProceedReason,
  OutcomeCode,
  QuashGuiltyFindingReason,
} from './HearingAndOutcomeResult'
import {
  PunishmentData,
  PunishmentDataV2,
  PunishmentDataWithSchedule,
  PunishmentType,
  SuspendedPunishmentResult,
} from './PunishmentResult'
import { User } from './hmppsManageUsersClient'

export interface IncidentDetailsEnhanced extends IncidentDetails {
  prisonerNumber: string
  agencyId: string
  overrideAgencyId?: string
  gender: PrisonerGender
}

export type OutcomeInfo = {
  code: OutcomeCode
  details?: string
  reason?: NotProceedReason
}

export type HearingDismissedOutcomeDetails = {
  adjudicator: string
  plea: HearingOutcomePlea
  details: string
}

export type NotProceedHearingOutcomeDetails = {
  adjudicator: string
  plea: HearingOutcomePlea
  reason: NotProceedReason
  details: string
}

/**
 * @deprecated The method should not be used
 */
export type ChargeProvedHearingOutcomeDetails = {
  adjudicator: string
  plea: HearingOutcomePlea
  caution: boolean
  amount?: number
}

export type ChargeProvedHearingOutcomeDetailsV2 = {
  adjudicator: string
  plea: HearingOutcomePlea
}

export type QuashData = {
  reason: QuashGuiltyFindingReason
  details: string
}

/**
 * @deprecated The method should not be used
 */
export type AmendedHearingOutcomeData = {
  adjudicator?: string
  adjournReason?: HearingOutcomeAdjournReason
  notProceedReason?: NotProceedReason
  details?: string
  plea?: HearingOutcomePlea
  caution?: boolean
  amount?: string
  damagesOwed?: boolean
}

export type AmendedHearingOutcomeDataV2 = {
  adjudicator?: string
  adjournReason?: HearingOutcomeAdjournReason
  notProceedReason?: NotProceedReason
  details?: string
  plea?: HearingOutcomePlea
}

export type AmendedOutcomeData = {
  details?: string
  reason?: NotProceedReason | QuashGuiltyFindingReason
  quashedReason?: QuashGuiltyFindingReason
}

export type AgencyReportCounts = {
  reviewTotal: number
  transferReviewTotal: number
}

export type ConsecutiveAdditionalDaysReport = {
  reportNumber: number
  chargeProvedDate: string
  punishment: PunishmentDataWithSchedule
  consecutiveReportNumber?: number
  consecutiveReportAvailable?: boolean
}

export default class ManageAdjudicationsClient {
  restClient: RestClient

  constructor(user: User) {
    this.restClient = new RestClient(
      'Manage Adjudications API',
      config.apis.adjudications,
      user.token,
      user.activeCaseLoadId
    )
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

  /**
   * @deprecated The method should not be used
   */
  async getReportedAdjudication(chargeNumber: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.get({
      path: `/reported-adjudications/${chargeNumber}`,
    })
  }

  async getReportedAdjudicationV2(chargeNumber: string): Promise<ReportedAdjudicationResultV2> {
    return this.restClient.get({
      path: `/reported-adjudications/${chargeNumber}/v2`,
    })
  }

  async updateAdjudicationStatus(
    chargeNumber: string,
    payload: ReviewAdjudication
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/status`,
      data: payload,
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
        `${(filter.status && `&status=${filter.status}`) || `&status=${allStatuses}`}` +
        `${(filter.transfersOnly && `&transfersOnly=${true}`) || ''}`

      return this.restClient.get({
        path,
      })
    }

  getAllCompletedAdjudications = this.getCompletedAdjudications('/reported-adjudications/reports')

  getYourCompletedAdjudications = this.getCompletedAdjudications('/reported-adjudications/my-reports')

  async getReportedAdjudicationIssueData(
    filter: ReportedAdjudicationDISFormFilter
  ): Promise<ReportedAdjudicationsResult> {
    const path =
      `/reported-adjudications/for-issue?` +
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

  async saveOffenceDetails(draftId: number, offenceDetails: OffenceDetails) {
    return this.restClient.put({
      path: `/draft-adjudications/${draftId}/offence-details`,
      data: { offenceDetails },
    })
  }

  async aloAmendOffenceDetails(draftId: number, offenceDetails: OffenceDetails): Promise<ReportedAdjudication> {
    return this.restClient.post({
      path: `/draft-adjudications/${draftId}/alo-offence-details`,
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

  async cancelHearing(chargeNumber: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${chargeNumber}/hearing/v2`,
    })
  }

  async cancelCompleteHearing(chargeNumber: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${chargeNumber}/remove-completed-hearing`,
    })
  }

  async createHearing(chargeNumber: string, hearingDetails: HearingDetails): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/hearing/v2`,
      data: hearingDetails,
    })
  }

  async amendHearing(chargeNumber: string, hearingDetails: HearingDetails): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/hearing/v2`,
      data: hearingDetails,
    })
  }

  async getHearingsGivenAgencyAndDate(chosenHearingDate: string): Promise<ScheduledHearingList> {
    return this.restClient.get({
      path: `/reported-adjudications/hearings?hearingDate=${chosenHearingDate}`,
    })
  }

  async amendGender(draftId: number, chosenGender: { gender: PrisonerGender }): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${draftId}/gender`,
      data: { ...chosenGender },
    })
  }

  async putDateTimeOfIssue(chargeNumber: string, dateTimeOfIssue: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/issue`,
      data: { dateTimeOfIssue },
    })
  }

  async createAdjourn(
    chargeNumber: string,
    hearingOutcomeDetails: HearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/hearing/outcome/adjourn`,
      data: {
        adjudicator: hearingOutcomeDetails.adjudicator,
        reason: hearingOutcomeDetails.reason,
        details: hearingOutcomeDetails.details,
        plea: hearingOutcomeDetails.plea,
      },
    })
  }

  async createReferral(
    chargeNumber: string,
    hearingOutcomeDetails: HearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/hearing/outcome/referral`,
      data: {
        code: hearingOutcomeDetails.code,
        adjudicator: hearingOutcomeDetails.adjudicator,
        details: hearingOutcomeDetails.details,
      },
    })
  }

  async createProsecution(chargeNumber: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/outcome/prosecution`,
    })
  }

  async createNotProceed(chargeNumber: string, outcomeDetails: OutcomeInfo): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/outcome/not-proceed`,
      data: { reason: outcomeDetails.reason, details: outcomeDetails.details },
    })
  }

  async createPoliceReferral(chargeNumber: string, outcomeDetails: OutcomeInfo): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/outcome/refer-police`,
      data: { details: outcomeDetails.details },
    })
  }

  async removeDraftAdjudication(draftAdjudicationId: number): Promise<void> {
    return this.restClient.delete({
      path: `/draft-adjudications/${draftAdjudicationId}`,
    })
  }

  async removeNotProceedOrQuashed(chargeNumber: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${chargeNumber}/outcome`,
    })
  }

  async removeAdjourn(chargeNumber: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${chargeNumber}/hearing/outcome/adjourn`,
    })
  }

  async removeReferral(chargeNumber: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${chargeNumber}/remove-referral`,
    })
  }

  async createDismissedHearingOutcome(
    chargeNumber: string,
    hearingOutcomeDetails: HearingDismissedOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/complete-hearing/dismissed`,
      data: { ...hearingOutcomeDetails },
    })
  }

  /**
   * @deprecated The method should not be used
   */
  async createChargeProvedHearingOutcome(
    chargeNumber: string,
    chargeProvedHearingOutcomeDetails: ChargeProvedHearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/complete-hearing/charge-proved`,
      data: { ...chargeProvedHearingOutcomeDetails },
    })
  }

  async createChargeProvedHearingOutcomeV2(
    chargeNumber: string,
    chargeProvedHearingOutcomeDetails: ChargeProvedHearingOutcomeDetailsV2
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/complete-hearing/charge-proved/v2`,
      data: { ...chargeProvedHearingOutcomeDetails },
    })
  }

  async createNotProceedHearingOutcome(
    chargeNumber: string,
    notProceedHearingOutcomeDetails: NotProceedHearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/complete-hearing/not-proceed`,
      data: { ...notProceedHearingOutcomeDetails },
    })
  }

  async quashOutcome(chargeNumber: string, quashData: QuashData): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/outcome/quashed`,
      data: { ...quashData },
    })
  }

  /**
   * @deprecated The method should not be used
   */
  async amendHearingOutcome(
    chargeNumber: string,
    status: ReportedAdjudicationStatus,
    amendedData: AmendedHearingOutcomeData
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/hearing/outcome/${status}`,
      data: { ...amendedData },
    })
  }

  async amendHearingOutcomeV2(
    chargeNumber: string,
    status: ReportedAdjudicationStatus,
    amendedData: AmendedHearingOutcomeDataV2
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/hearing/outcome/${status}/v2`,
      data: { ...amendedData },
    })
  }

  async amendOutcome(chargeNumber: string, amendedData: AmendedOutcomeData): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/outcome`,
      data: { ...amendedData },
    })
  }

  /**
   * @deprecated The method should not be used
   */
  async createPunishments(chargeNumber: string, punishments: PunishmentData[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/punishments`,
      data: { punishments: [...punishments] },
    })
  }

  async createPunishmentsV2(
    chargeNumber: string,
    punishments: PunishmentDataV2[]
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/punishments/v2`,
      data: { punishments: [...punishments] },
    })
  }

  /**
   * @deprecated The method should not be used
   */
  async amendPunishments(chargeNumber: string, punishments: PunishmentData[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/punishments`,
      data: { punishments: [...punishments] },
    })
  }

  async amendPunishmentsV2(chargeNumber: string, punishments: PunishmentDataV2[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/punishments/v2`,
      data: { punishments: [...punishments] },
    })
  }

  async getSuspendedPunishments(prisonerNumber: string, reportNumber: string): Promise<SuspendedPunishmentResult[]> {
    return this.restClient.get({
      path: `/reported-adjudications/punishments/${prisonerNumber}/suspended?reportNumber=${reportNumber}`,
    })
  }

  async createPunishmentComment(chargeNumber: string, punishmentComment: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/punishments/comment`,
      data: { comment: punishmentComment },
    })
  }

  async amendPunishmentComment(
    chargeNumber: string,
    id: number,
    punishmentComment: string
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${chargeNumber}/punishments/comment`,
      data: { id, comment: punishmentComment },
    })
  }

  async removePunishmentComment(chargeNumber: string, id: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${chargeNumber}/punishments/comment/${id}`,
    })
  }

  async getAgencyReportCounts(): Promise<AgencyReportCounts> {
    return this.restClient.get({
      path: `/reported-adjudications/report-counts`,
    })
  }

  async getPossibleConsecutivePunishments(
    prisonerNumber: string,
    punishmentType: PunishmentType,
    chargeNumber: string
  ): Promise<ConsecutiveAdditionalDaysReport[]> {
    return this.restClient.get({
      path: `/reported-adjudications/punishments/${prisonerNumber}/for-consecutive?type=${punishmentType}&chargeNumber=${chargeNumber}`,
    })
  }
}
