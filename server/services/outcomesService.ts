import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { NotProceedReason, OutcomeCode } from '../data/OutcomeResult'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'

export default class OutcomesService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createProsecution(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    const outcomeDetails = {
      code: OutcomeCode.PROSECUTION,
    }
    return new ManageAdjudicationsClient(user.token).createOutcome(adjudicationNumber, outcomeDetails)
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
    return new ManageAdjudicationsClient(user.token).createOutcome(adjudicationNumber, outcomeDetails)
  }

  async removeReferral(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user.token).removeReferral(adjudicationNumber)
  }
}
