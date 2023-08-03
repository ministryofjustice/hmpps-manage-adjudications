import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
  NotProceedReason,
} from '../data/HearingAndOutcomeResult'

import HmppsAuthClient from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import {
  OicHearingType,
  ReportedAdjudicationResult,
  ReportedAdjudicationResultV2,
  ReportedAdjudicationStatus,
} from '../data/ReportedAdjudicationResult'
import { User } from '../data/hmppsManageUsersClient'

export default class HearingsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createReferral(
    chargeNumber: string,
    hearingOutcome: HearingOutcomeCode,
    adjudicatorName: string,
    referralReason: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      code: hearingOutcome,
      details: referralReason,
    }
    return new ManageAdjudicationsClient(user).createReferral(chargeNumber, hearingOutcomeDetails)
  }

  async createAdjourn(
    chargeNumber: string,
    hearingOutcome: HearingOutcomeCode,
    adjudicatorName: string,
    details: string,
    adjournReason: HearingOutcomeAdjournReason,
    plea: HearingOutcomePlea,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      code: hearingOutcome,
      details,
      reason: adjournReason,
      plea,
    }
    return new ManageAdjudicationsClient(user).createAdjourn(chargeNumber, hearingOutcomeDetails)
  }

  async getHearingOutcome(chargeNumber: string, user: User) {
    const adjudication = await new ManageAdjudicationsClient(user).getReportedAdjudication(chargeNumber)
    const { outcomes } = adjudication.reportedAdjudication
    const latestHearing = outcomes.length && outcomes[outcomes.length - 1]
    return latestHearing?.hearing.outcome || null
  }

  async getHearingAdjudicatorType(chargeNumber: string, user: User) {
    const adjudication = await new ManageAdjudicationsClient(user).getReportedAdjudication(chargeNumber)
    const { outcomes } = adjudication.reportedAdjudication
    const latestHearing = outcomes.length && outcomes[outcomes.length - 1]
    return latestHearing.hearing.oicHearingType as OicHearingType
  }

  async createDismissedHearingOutcome(
    chargeNumber: string,
    adjudicatorName: string,
    plea: HearingOutcomePlea,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      plea,
      details,
    }

    return new ManageAdjudicationsClient(user).createDismissedHearingOutcome(chargeNumber, hearingOutcomeDetails)
  }

  async createChargedProvedHearingOutcome(
    chargeNumber: string,
    adjudicatorName: string,
    plea: HearingOutcomePlea,
    caution: boolean,
    user: User,
    amount?: string
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      plea,
      caution,
      amount: !amount ? null : Number(amount),
    }

    return new ManageAdjudicationsClient(user).createChargeProvedHearingOutcome(chargeNumber, hearingOutcomeDetails)
  }

  async createChargedProvedHearingOutcomeV2(
    chargeNumber: string,
    adjudicatorName: string,
    plea: HearingOutcomePlea,
    user: User
  ): Promise<ReportedAdjudicationResultV2> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      plea,
    }

    return new ManageAdjudicationsClient(user).createChargeProvedHearingOutcomeV2(chargeNumber, hearingOutcomeDetails)
  }

  async createNotProceedHearingOutcome(
    chargeNumber: string,
    adjudicator: string,
    plea: HearingOutcomePlea,
    reason: NotProceedReason,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator,
      plea,
      reason,
      details,
    }

    return new ManageAdjudicationsClient(user).createNotProceedHearingOutcome(chargeNumber, hearingOutcomeDetails)
  }

  async editAdjournHearingOutcome(
    chargeNumber: string,
    details: string,
    adjournReason: HearingOutcomeAdjournReason,
    plea: HearingOutcomePlea,
    user: User,
    adjudicator?: string
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      details,
      adjournReason,
      plea,
    }
    return new ManageAdjudicationsClient(user).amendHearingOutcome(
      chargeNumber,
      ReportedAdjudicationStatus.ADJOURNED,
      data
    )
  }

  async editReferralHearingOutcome(
    chargeNumber: string,
    hearingOutcome: HearingOutcomeCode,
    referralReason: string,
    user: User,
    adjudicator?: string
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      details: referralReason,
    }
    const status =
      hearingOutcome === HearingOutcomeCode.REFER_INAD
        ? ReportedAdjudicationStatus.REFER_INAD
        : ReportedAdjudicationStatus.REFER_POLICE
    return new ManageAdjudicationsClient(user).amendHearingOutcome(chargeNumber, status, data)
  }

  async editChargeProvedOutcome(
    chargeNumber: string,
    caution: boolean,
    user: User,
    adjudicator?: string,
    plea?: HearingOutcomePlea,
    amount?: string,
    damagesOwed?: boolean
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      plea,
      caution,
      amount,
      damagesOwed,
    }
    return new ManageAdjudicationsClient(user).amendHearingOutcome(
      chargeNumber,
      ReportedAdjudicationStatus.CHARGE_PROVED,
      data
    )
  }

  async editChargeProvedOutcomeV2(
    chargeNumber: string,
    user: User,
    adjudicator?: string,
    plea?: HearingOutcomePlea
  ): Promise<ReportedAdjudicationResultV2> {
    const data = {
      ...(adjudicator && { adjudicator }),
      plea,
    }
    return new ManageAdjudicationsClient(user).amendHearingOutcomeV2(
      chargeNumber,
      ReportedAdjudicationStatus.CHARGE_PROVED,
      data
    )
  }

  async editDismissedOutcome(
    chargeNumber: string,
    details: string,
    user: User,
    adjudicator?: string,
    plea?: HearingOutcomePlea
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      plea,
      details,
    }
    return new ManageAdjudicationsClient(user).amendHearingOutcome(
      chargeNumber,
      ReportedAdjudicationStatus.DISMISSED,
      data
    )
  }

  async editNotProceedHearingOutcome(
    chargeNumber: string,
    reason: NotProceedReason,
    details: string,
    user: User,
    adjudicator?: string,
    plea?: HearingOutcomePlea
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      plea,
      details,
      notProceedReason: reason,
    }
    return new ManageAdjudicationsClient(user).amendHearingOutcome(
      chargeNumber,
      ReportedAdjudicationStatus.NOT_PROCEED,
      data
    )
  }
}
