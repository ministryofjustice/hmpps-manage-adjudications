import { HearingOutcomeAdjournReason, HearingOutcomeCode, HearingOutcomePlea } from '../data/HearingResult'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'

export default class HearingsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createHearingOutcome(
    adjudicationNumber: number,
    hearingId: number,
    hearingOutcome: HearingOutcomeCode,
    adjudicatorName: string,
    details: string,
    user: User,
    adjournReason?: HearingOutcomeAdjournReason,
    plea?: HearingOutcomePlea
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      code: hearingOutcome,
      details,
      reason: adjournReason,
      plea,
    }
    return new ManageAdjudicationsClient(user.token).createHearingOutcome(
      adjudicationNumber,
      hearingId,
      hearingOutcomeDetails
    )
  }

  async updateHearingOutcome(
    adjudicationNumber: number,
    hearingId: number,
    hearingOutcome: HearingOutcomeCode,
    adjudicatorName: string,
    details: string,
    user: User,
    adjournReason?: HearingOutcomeAdjournReason,
    plea?: HearingOutcomePlea
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      code: hearingOutcome,
      details,
      reason: adjournReason,
      plea,
    }
    return new ManageAdjudicationsClient(user.token).updateHearingOutcome(
      adjudicationNumber,
      hearingId,
      hearingOutcomeDetails
    )
  }

  async getHearingOutcome(adjudicationNumber: number, hearingId: number, user: User) {
    const adjudication = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)
    const { hearings } = adjudication.reportedAdjudication
    const chosenHearing = hearings.filter(hearing => hearing.id === hearingId)
    return chosenHearing[0].outcome || null
  }
}
