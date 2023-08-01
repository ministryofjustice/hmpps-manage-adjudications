import { NotProceedReason, OutcomeCode, QuashGuiltyFindingReason } from '../data/HearingAndOutcomeResult'
import HmppsAuthClient from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'
import { User } from '../data/hmppsManageUsersClient'

export default class OutcomesService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createProsecution(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user).createProsecution(adjudicationNumber)
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
    return new ManageAdjudicationsClient(user).createNotProceed(adjudicationNumber, outcomeDetails)
  }

  async removeReferral(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user).removeReferral(adjudicationNumber)
  }

  async removeNotProceedOrQuashed(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user).removeNotProceedOrQuashed(adjudicationNumber)
  }

  async removeAdjournOutcome(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user).removeAdjourn(adjudicationNumber)
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
    return new ManageAdjudicationsClient(user).createPoliceReferral(adjudicationNumber, outcomeDetails)
  }

  async editPoliceReferralOutcome(
    adjudicationNumber: number,
    referralReason: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details: referralReason,
    }
    return new ManageAdjudicationsClient(user).amendOutcome(adjudicationNumber, data)
  }

  async quashAGuiltyFinding(
    adjudicationNumber: number,
    quashReason: QuashGuiltyFindingReason,
    quashDetails: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details: quashDetails,
      reason: quashReason,
    }
    return new ManageAdjudicationsClient(user).quashOutcome(adjudicationNumber, data)
  }

  async editNotProceedOutcome(
    adjudicationNumber: number,
    notProceedReason: NotProceedReason,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details,
      reason: notProceedReason,
    }
    return new ManageAdjudicationsClient(user).amendOutcome(adjudicationNumber, data)
  }

  async editQuashedOutcome(
    adjudicationNumber: number,
    quashReason: QuashGuiltyFindingReason,
    quashDetails: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details: quashDetails,
      quashedReason: quashReason,
    }
    return new ManageAdjudicationsClient(user).amendOutcome(adjudicationNumber, data)
  }
}
