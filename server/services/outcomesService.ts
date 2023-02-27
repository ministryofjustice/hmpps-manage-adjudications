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
    return new ManageAdjudicationsClient(user.token).createProsecution(adjudicationNumber, outcomeDetails)
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
