import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
  NotProceedReason,
} from '../data/HearingAndOutcomeResult'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { ReportedAdjudicationResult, ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'

export default class HearingsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createReferral(
    adjudicationNumber: number,
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
    return new ManageAdjudicationsClient(user.token).createReferral(adjudicationNumber, hearingOutcomeDetails)
  }

  async createAdjourn(
    adjudicationNumber: number,
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
    return new ManageAdjudicationsClient(user.token).createAdjourn(adjudicationNumber, hearingOutcomeDetails)
  }

  async getHearingOutcome(adjudicationNumber: number, user: User) {
    const adjudication = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)
    const { outcomes } = adjudication.reportedAdjudication
    const latestHearing = outcomes.length && outcomes[outcomes.length - 1]
    return latestHearing?.hearing.outcome || null
  }

  async createDismissedHearingOutcome(
    adjudicationNumber: number,
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

    return new ManageAdjudicationsClient(user.token).createDismissedHearingOutcome(
      adjudicationNumber,
      hearingOutcomeDetails
    )
  }

  async createChargedProvedHearingOutcome(
    adjudicationNumber: number,
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

    return new ManageAdjudicationsClient(user.token).createChargeProvedHearingOutcome(
      adjudicationNumber,
      hearingOutcomeDetails
    )
  }

  async createNotProceedHearingOutcome(
    adjudicationNumber: number,
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

    return new ManageAdjudicationsClient(user.token).createNotProceedHearingOutcome(
      adjudicationNumber,
      hearingOutcomeDetails
    )
  }

  async editAdjournHearingOutcome(
    adjudicationNumber: number,
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
    return new ManageAdjudicationsClient(user.token).amendHearingOutcome(
      adjudicationNumber,
      ReportedAdjudicationStatus.ADJOURNED,
      data
    )
  }

  async editChargeProvedOutcome(
    adjudicationNumber: number,
    caution: boolean,
    user: User,
    adjudicator?: string,
    plea?: HearingOutcomePlea,
    amount?: string
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      ...(adjudicator && { adjudicator }),
      plea,
      caution,
      amount,
    }
    return new ManageAdjudicationsClient(user.token).amendHearingOutcome(
      adjudicationNumber,
      ReportedAdjudicationStatus.CHARGE_PROVED,
      data
    )
  }

  async editDismissedOutcome(
    adjudicationNumber: number,
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
    return new ManageAdjudicationsClient(user.token).amendHearingOutcome(
      adjudicationNumber,
      ReportedAdjudicationStatus.DISMISSED,
      data
    )
  }
}
