import { NotProceedReason, OutcomeCode } from '../data/HearingAndOutcomeResult'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'

export default class OutcomesService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createProsecution(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).createProsecution(adjudicationNumber)
  }

  async createNotProceed(
    adjudicationNumber: number,
    reason: NotProceedReason,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const outcomeDetails = {
      code: OutcomeCode.NOT_PROCEED,
      reason,
      details,
    }
    return new ManageAdjudicationsClient(user.token).createNotProceed(adjudicationNumber, outcomeDetails)
  }

  async removeReferral(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).removeReferral(adjudicationNumber)
  }

  async removeNotProceedOrQuashed(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).removeNotProceedOrQuashed(adjudicationNumber)
  }

  async removeAdjournOutcome(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).removeAdjourn(adjudicationNumber)
  }

  async createPoliceReferral(
    adjudicationNumber: number,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const outcomeDetails = {
      code: OutcomeCode.REFER_POLICE,
      details,
    }
    return new ManageAdjudicationsClient(user.token).createPoliceReferral(adjudicationNumber, outcomeDetails)
  }
}
