import config from '../config'
import { OffenceDetails } from './DraftAdjudicationResult'
import {
  ReportedAdjudicationResult,
  ReportedAdjudication,
  ReportedAdjudicationStatus,
  ReportedAdjudicationFilter,
  allStatuses,
  ReviewAdjudication,
} from './ReportedAdjudicationResult'
import RestClient from './restClient'
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
  PunishmentDataWithSchedule,
  PunishmentReasonForChange,
  PunishmentType,
  SuspendedPunishmentResult,
} from './PunishmentResult'
import { User } from './hmppsManageUsersClient'
import { ApiPageRequest, ApiPageResponse } from './ApiData'
import { momentDateToApi } from '../utils/utils'

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
}

export type AmendedOutcomeData = {
  details?: string
  reason?: NotProceedReason | QuashGuiltyFindingReason
  quashedReason?: QuashGuiltyFindingReason
}

export type ConsecutiveAdditionalDaysReport = {
  chargeNumber: string
  chargeProvedDate: string
  punishment: PunishmentDataWithSchedule
}

/**
 * Use this client when we want to make calls to the Adjudications API and pass the user tokens, this
 * includes DPS roles such as ALO (ADJUDICATIONS_REVIEWER). As opposed to passing the system tokens (client credentials)
 * which we have a different client for - ManageAdjudicationsSystemTokensClient.ts
 */
export default class ManageAdjudicationsUserTokensClient {
  restClient: RestClient

  constructor(user: User) {
    this.restClient = new RestClient(
      'Manage Adjudications API',
      config.apis.adjudications,
      user.token,
      user.activeCaseLoadId
    )
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

  async aloAmendOffenceDetails(draftId: number, offenceDetails: OffenceDetails): Promise<ReportedAdjudication> {
    return this.restClient.post({
      path: `/draft-adjudications/${draftId}/alo-offence-details`,
      data: { offenceDetails },
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

  async createGovReferral(chargeNumber: string, outcomeDetails: OutcomeInfo): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/outcome/refer-gov`,
      data: { details: outcomeDetails.details },
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

  async createChargeProvedHearingOutcome(
    chargeNumber: string,
    chargeProvedHearingOutcomeDetails: ChargeProvedHearingOutcomeDetails
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

  async amendHearingOutcome(
    chargeNumber: string,
    status: ReportedAdjudicationStatus,
    amendedData: AmendedHearingOutcomeData
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

  async createPunishments(chargeNumber: string, punishments: PunishmentData[]): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/punishments/v2`,
      data: { punishments: [...punishments] },
    })
  }

  async amendPunishments(chargeNumber: string, punishments: PunishmentData[]): Promise<ReportedAdjudicationResult> {
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

  async createPunishmentComment(
    chargeNumber: string,
    punishmentComment: string,
    reasonForChange?: PunishmentReasonForChange
  ): Promise<ReportedAdjudicationResult> {
    return this.restClient.post({
      path: `/reported-adjudications/${chargeNumber}/punishments/comment`,
      data: { comment: punishmentComment, reasonForChange },
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
