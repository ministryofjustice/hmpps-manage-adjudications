import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
  NotProceedReason,
  ReferGovReason,
} from '../data/HearingAndOutcomeResult'

import HmppsAuthClient from '../data/hmppsAuthClient'
import ManageAdjudicationsSystemTokensClient from '../data/manageAdjudicationsSystemTokensClient'
import {
  OicHearingType,
  ReportedAdjudicationResult,
  ReportedAdjudicationStatus,
} from '../data/ReportedAdjudicationResult'
import { User } from '../data/hmppsManageUsersClient'
import ManageAdjudicationsUserTokensClient from '../data/manageAdjudicationsUserTokensClient'

export default class HearingsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createReferral(
    chargeNumber: string,
    hearingOutcome: HearingOutcomeCode,
    adjudicatorName: string,
    referralReason: string,
    referGovReason: ReferGovReason,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      code: hearingOutcome,
      details: referralReason,
      referGovReason,
    }
    return new ManageAdjudicationsUserTokensClient(user).createReferral(chargeNumber, hearingOutcomeDetails)
  }

  async createAdjourn(
    chargeNumber: string,
    hearingOutcome: HearingOutcomeCode,
    adjudicatorName: string,
    details: string,
    adjournReason: HearingOutcomeAdjournReason,
    plea: HearingOutcomePlea,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      code: hearingOutcome,
      details,
      reason: adjournReason,
      plea,
    }
    return new ManageAdjudicationsUserTokensClient(user).createAdjourn(chargeNumber, hearingOutcomeDetails)
  }

  async getHearingOutcome(chargeNumber: string, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const adjudication = await new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudication(
      chargeNumber,
    )
    const { outcomes } = adjudication.reportedAdjudication
    const latestHearing = outcomes.length && outcomes[outcomes.length - 1]
    return latestHearing?.hearing.outcome || null
  }

  async getHearingAdjudicatorType(chargeNumber: string, user: User) {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const adjudication = await new ManageAdjudicationsSystemTokensClient(token, user).getReportedAdjudication(
      chargeNumber,
    )
    const { outcomes } = adjudication.reportedAdjudication
    const latestHearing = outcomes.length && outcomes[outcomes.length - 1]
    return latestHearing.hearing.oicHearingType as OicHearingType
  }

  async createDismissedHearingOutcome(
    chargeNumber: string,
    adjudicatorName: string,
    plea: HearingOutcomePlea,
    details: string,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      plea,
      details,
    }

    return new ManageAdjudicationsUserTokensClient(user).createDismissedHearingOutcome(
      chargeNumber,
      hearingOutcomeDetails,
    )
  }

  async createChargedProvedHearingOutcome(
    chargeNumber: string,
    adjudicatorName: string,
    plea: HearingOutcomePlea,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      plea,
    }

    return new ManageAdjudicationsUserTokensClient(user).createChargeProvedHearingOutcome(
      chargeNumber,
      hearingOutcomeDetails,
    )
  }

  async createNotProceedHearingOutcome(
    chargeNumber: string,
    adjudicator: string,
    plea: HearingOutcomePlea,
    reason: NotProceedReason,
    details: string,
    user: User,
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator,
      plea,
      reason,
      details,
    }

    return new ManageAdjudicationsUserTokensClient(user).createNotProceedHearingOutcome(
      chargeNumber,
      hearingOutcomeDetails,
    )
  }

  async editAdjournHearingOutcome(
    chargeNumber: string,
    details: string,
    adjournReason: HearingOutcomeAdjournReason,
    plea: HearingOutcomePlea,
    user: User,
    adjudicator?: string,
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      details,
      adjournReason,
      plea,
    }
    return new ManageAdjudicationsUserTokensClient(user).amendHearingOutcome(
      chargeNumber,
      ReportedAdjudicationStatus.ADJOURNED,
      data,
    )
  }

  async editReferralHearingOutcome(
    chargeNumber: string,
    hearingOutcome: HearingOutcomeCode,
    referralReason: string,
    user: User,
    adjudicator?: string,
    referGovReason?: ReferGovReason,
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      details: referralReason,
      ...(referGovReason && { referGovReason }),
    }
    const status = this.getStatusFromHearingOutcomeCode(hearingOutcome)
    return new ManageAdjudicationsUserTokensClient(user).amendHearingOutcome(chargeNumber, status, data)
  }

  getStatusFromHearingOutcomeCode = (hearingOutcomeCode: HearingOutcomeCode) => {
    switch (hearingOutcomeCode) {
      case HearingOutcomeCode.REFER_INAD:
        return ReportedAdjudicationStatus.REFER_INAD
      case HearingOutcomeCode.REFER_POLICE:
        return ReportedAdjudicationStatus.REFER_POLICE
      case HearingOutcomeCode.REFER_GOV:
        return ReportedAdjudicationStatus.REFER_GOV
      default:
        return null
    }
  }

  async editChargeProvedOutcome(
    chargeNumber: string,
    user: User,
    adjudicator?: string,
    plea?: HearingOutcomePlea,
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      plea,
    }
    return new ManageAdjudicationsUserTokensClient(user).amendHearingOutcome(
      chargeNumber,
      ReportedAdjudicationStatus.CHARGE_PROVED,
      data,
    )
  }

  async editDismissedOutcome(
    chargeNumber: string,
    details: string,
    user: User,
    adjudicator?: string,
    plea?: HearingOutcomePlea,
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      plea,
      details,
    }
    return new ManageAdjudicationsUserTokensClient(user).amendHearingOutcome(
      chargeNumber,
      ReportedAdjudicationStatus.DISMISSED,
      data,
    )
  }

  async editNotProceedHearingOutcome(
    chargeNumber: string,
    reason: NotProceedReason,
    details: string,
    user: User,
    adjudicator?: string,
    plea?: HearingOutcomePlea,
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      plea,
      details,
      notProceedReason: reason,
    }
    return new ManageAdjudicationsUserTokensClient(user).amendHearingOutcome(
      chargeNumber,
      ReportedAdjudicationStatus.NOT_PROCEED,
      data,
    )
  }
}
