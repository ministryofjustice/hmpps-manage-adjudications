import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomeFinding,
  HearingOutcomePlea,
} from '../data/HearingAndOutcomeResult'

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
    return new ManageAdjudicationsClient(user.token).createHearingOutcome(adjudicationNumber, hearingOutcomeDetails)
  }

  async updateReferral(
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
    return new ManageAdjudicationsClient(user.token).updateHearingOutcome(adjudicationNumber, hearingOutcomeDetails)
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
    return new ManageAdjudicationsClient(user.token).createHearingOutcome(adjudicationNumber, hearingOutcomeDetails)
  }

  async updateAdjourn(
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
    return new ManageAdjudicationsClient(user.token).updateHearingOutcome(adjudicationNumber, hearingOutcomeDetails)
  }

  async postHearingPleaAndFinding(
    adjudicationNumber: number,
    hearingOutcome: HearingOutcomeCode,
    adjudicatorName: string,
    hearingPlea: HearingOutcomePlea,
    hearingFinding: HearingOutcomeFinding,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      code: hearingOutcome,
      plea: hearingPlea,
      finding: hearingFinding,
    }
    return new ManageAdjudicationsClient(user.token).createHearingOutcome(adjudicationNumber, hearingOutcomeDetails)
  }

  async updateHearingPleaAndFinding(
    adjudicationNumber: number,
    hearingOutcome: HearingOutcomeCode,
    adjudicatorName: string,
    hearingPlea: HearingOutcomePlea,
    hearingFinding: HearingOutcomeFinding,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const hearingOutcomeDetails = {
      adjudicator: adjudicatorName,
      code: hearingOutcome,
      plea: hearingPlea,
      finding: hearingFinding,
    }
    return new ManageAdjudicationsClient(user.token).updateHearingOutcome(adjudicationNumber, hearingOutcomeDetails)
  }

  async getHearingOutcome(adjudicationNumber: number, hearingId: number, user: User) {
    const adjudication = await new ManageAdjudicationsClient(user.token).getReportedAdjudication(adjudicationNumber)
    const { hearings } = adjudication.reportedAdjudication
    const chosenHearing = hearings.filter(hearing => hearing.id === hearingId)
    return chosenHearing[0].outcome || null
  }
}
