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
import { PunishmentData, SuspendedPunishmentResult } from './PunishmentResult'
import { User } from './hmppsAuthClient'

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

export type ChargeProvedHearingOutcomeDetails = {
  adjudicator: string
  plea: HearingOutcomePlea
  caution: boolean
  amount?: number
}

export type QuashData = {
  reason: QuashGuiltyFindingReason
  details: string
}

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

export type AmendedOutcomeData = {
  details?: string
  reason?: NotProceedReason | QuashGuiltyFindingReason
  quashedReason?: QuashGuiltyFindingReason
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

  async postDraftIncidentStatement(id: number, incidentStatement: IncidentStatement): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/draft-adjudications/${id}/incident-statement`,
      data: { ...incidentStatement },
    })
  }

  async putDraftIncidentStatement(id: number, incidentStatement: IncidentStatement): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${id}/incident-statement`,
      data: { ...incidentStatement },
    })
  }

  async getDraftAdjudication(id: number): Promise<DraftAdjudicationResult> {
    return this.restClient.get({
      path: `/draft-adjudications/${id}`,
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

  async getReportedAdjudication(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.get({
      path: `/reported-adjudications/${adjudicationNumber}`,
    })
  }

  async updateAdjudicationStatus(
    adjudicationNumber: number,
    payload: ReviewAdjudication
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/status`,
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
        `${(filter.status && `&status=${filter.status}`) || `&status=${allStatuses}`}`

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

  async createDraftFromCompleteAdjudication(adjudicationNumber: number): Promise<DraftAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/create-draft-adjudication`,
    })
  }

  async getOffenceRule(offenceCode: number, isYouthOffender: boolean, gender: PrisonerGender): Promise<OffenceRule> {
    return this.restClient.get({
      path: `/draft-adjudications/offence-rule/${offenceCode}?youthOffender=${isYouthOffender}&gender=${gender}`,
    })
  }

  async saveOffenceDetails(adjudicationNumber: number, offenceDetails: OffenceDetails) {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/offence-details`,
      data: { offenceDetails },
    })
  }

  async aloAmendOffenceDetails(
    adjudicationNumber: number,
    offenceDetails: OffenceDetails
  ): Promise<ReportedAdjudication> {
    return this.restClient.post({
      path: `/draft-adjudications/${adjudicationNumber}/alo-offence-details`,
      data: { offenceDetails },
    })
  }

  async saveYouthOffenderStatus(
    adjudicationNumber: number,
    applicableRulesData: ApplicableRules
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/applicable-rules`,
      data: applicableRulesData,
    })
  }

  async saveAssociatedPrisoner(
    adjudicationNumber: number,
    associatedPrisoner: AssociatedPrisoner
  ): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/associated-prisoner`,
      data: associatedPrisoner,
    })
  }

  async saveDamageDetails(adjudicationNumber: number, damages: DamageDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/damages`,
      data: { damages },
    })
  }

  async updateDamageDetails(adjudicationNumber: number, damages: DamageDetails[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/damages/edit`,
      data: { damages },
    })
  }

  async saveEvidenceDetails(adjudicationNumber: number, evidence: EvidenceDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/evidence`,
      data: { evidence },
    })
  }

  async updateEvidenceDetails(
    adjudicationNumber: number,
    evidence: EvidenceDetails[]
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/evidence/edit`,
      data: { evidence },
    })
  }

  async saveWitnessDetails(adjudicationNumber: number, witnesses: WitnessDetails[]): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${adjudicationNumber}/witnesses`,
      data: { witnesses },
    })
  }

  async updateWitnessDetails(
    adjudicationNumber: number,
    witnesses: WitnessDetails[]
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/witnesses/edit`,
      data: { witnesses },
    })
  }

  async cancelHearing(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/v2`,
    })
  }

  async cancelCompleteHearing(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${adjudicationNumber}/remove-completed-hearing`,
    })
  }

  async createHearing(adjudicationNumber: number, hearingDetails: HearingDetails): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/v2`,
      data: hearingDetails,
    })
  }

  async amendHearing(adjudicationNumber: number, hearingDetails: HearingDetails): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/v2`,
      data: hearingDetails,
    })
  }

  async getHearingsGivenAgencyAndDate(chosenHearingDate: string): Promise<ScheduledHearingList> {
    return this.restClient.get({
      path: `/reported-adjudications/hearings?hearingDate=${chosenHearingDate}`,
    })
  }

  async amendGender(id: number, chosenGender: { gender: PrisonerGender }): Promise<DraftAdjudicationResult> {
    return this.restClient.put({
      path: `/draft-adjudications/${id}/gender`,
      data: { ...chosenGender },
    })
  }

  async putDateTimeOfIssue(adjudicationNumber: number, dateTimeOfIssue: string): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/issue`,
      data: { dateTimeOfIssue },
    })
  }

  async createAdjourn(
    adjudicationNumber: number,
    hearingOutcomeDetails: HearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/outcome/adjourn`,
      data: {
        adjudicator: hearingOutcomeDetails.adjudicator,
        reason: hearingOutcomeDetails.reason,
        details: hearingOutcomeDetails.details,
        plea: hearingOutcomeDetails.plea,
      },
    })
  }

  async createReferral(
    adjudicationNumber: number,
    hearingOutcomeDetails: HearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/outcome/referral`,
      data: {
        code: hearingOutcomeDetails.code,
        adjudicator: hearingOutcomeDetails.adjudicator,
        details: hearingOutcomeDetails.details,
      },
    })
  }

  async createProsecution(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/outcome/prosecution`,
    })
  }

  async createNotProceed(adjudicationNumber: number, outcomeDetails: OutcomeInfo): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/outcome/not-proceed`,
      data: { reason: outcomeDetails.reason, details: outcomeDetails.details },
    })
  }

  async createPoliceReferral(
    adjudicationNumber: number,
    outcomeDetails: OutcomeInfo
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/outcome/refer-police`,
      data: { details: outcomeDetails.details },
    })
  }

  async removeDraftAdjudication(draftAdjudicationId: number): Promise<void> {
    return this.restClient.delete({
      path: `/draft-adjudications/${draftAdjudicationId}`,
    })
  }

  async removeNotProceedOrQuashed(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${adjudicationNumber}/outcome`,
    })
  }

  async removeAdjourn(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/outcome/adjourn`,
    })
  }

  async removeReferral(adjudicationNumber: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${adjudicationNumber}/remove-referral`,
    })
  }

  async createDismissedHearingOutcome(
    adjudicationNumber: number,
    hearingOutcomeDetails: HearingDismissedOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/complete-hearing/dismissed`,
      data: { ...hearingOutcomeDetails },
    })
  }

  async createChargeProvedHearingOutcome(
    adjudicationNumber: number,
    chargeProvedHearingOutcomeDetails: ChargeProvedHearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/complete-hearing/charge-proved`,
      data: { ...chargeProvedHearingOutcomeDetails },
    })
  }

  async createNotProceedHearingOutcome(
    adjudicationNumber: number,
    notProceedHearingOutcomeDetails: NotProceedHearingOutcomeDetails
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/complete-hearing/not-proceed`,
      data: { ...notProceedHearingOutcomeDetails },
    })
  }

  async quashOutcome(adjudicationNumber: number, quashData: QuashData): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/outcome/quashed`,
      data: { ...quashData },
    })
  }

  async amendHearingOutcome(
    adjudicationNumber: number,
    status: ReportedAdjudicationStatus,
    amendedData: AmendedHearingOutcomeData
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/hearing/outcome/${status}`,
      data: { ...amendedData },
    })
  }

  async amendOutcome(adjudicationNumber: number, amendedData: AmendedOutcomeData): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/outcome`,
      data: { ...amendedData },
    })
  }

  async createPunishments(
    adjudicationNumber: number,
    punishments: PunishmentData[]
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/punishments`,
      data: { punishments: [...punishments] },
    })
  }

  async amendPunishments(
    adjudicationNumber: number,
    punishments: PunishmentData[]
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/punishments`,
      data: { punishments: [...punishments] },
    })
  }

  async getSuspendedPunishments(prisonerNumber: string): Promise<SuspendedPunishmentResult[]> {
    return this.restClient.get({
      path: `/reported-adjudications/punishments/${prisonerNumber}/suspended`,
    })
  }

  async createPunishmentComment(
    adjudicationNumber: number,
    punishmentComment: string
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${adjudicationNumber}/punishments/comment`,
      data: { comment: punishmentComment },
    })
  }

  async amendPunishmentComment(
    adjudicationNumber: number,
    id: number,
    punishmentComment: string
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.put({
      path: `/reported-adjudications/${adjudicationNumber}/punishments/comment`,
      data: { id, comment: punishmentComment },
    })
  }

  async removePunishmentComment(adjudicationNumber: number, id: number): Promise<ReportedAdjudicationResult> {
    return this.restClient.delete({
      path: `/reported-adjudications/${adjudicationNumber}/punishments/comment/${id}`,
    })
  }
}
