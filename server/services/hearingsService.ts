import { HearingOutcomeCode } from '../data/HearingResult'

import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'

export default class HearingsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async postHearingReferralOutcome(
    adjudicationNumber: number,
    hearingId: number,
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
    return new ManageAdjudicationsClient(user.token).createHearingOutcome(
      adjudicationNumber,
      hearingId,
      hearingOutcomeDetails
    )
  }

  async updateHearingReferralOutcome(
    adjudicationNumber: number,
    hearingId: number,
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