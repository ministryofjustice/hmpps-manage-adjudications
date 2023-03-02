import { HearingOutcomeAdjournReason, HearingOutcomeCode, HearingOutcomePlea } from '../data/HearingAndOutcomeResult'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'

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

  async getHearingOutcome(adjudicationNumber: number, hearingId: number, user: User) {
    const adjudication = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)
    const { hearings } = adjudication.reportedAdjudication
    const chosenHearing = hearings.filter(hearing => hearing.id === hearingId)
    return chosenHearing[0].outcome || null
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
}
