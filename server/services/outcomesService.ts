import { NotProceedReason, OutcomeCode, QuashGuiltyFindingReason } from '../data/HearingAndOutcomeResult'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'
import { User } from '../data/hmppsManageUsersClient'
import ManageAdjudicationsUserTokensClient from '../data/manageAdjudicationsUserTokensClient'

export default class OutcomesService {
  async createProsecution(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).createProsecution(chargeNumber)
  }

  async createNotProceed(
    chargeNumber: string,
    reason: NotProceedReason,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const outcomeDetails = {
      code: OutcomeCode.NOT_PROCEED,
      reason,
      details,
    }
    return new ManageAdjudicationsUserTokensClient(user).createNotProceed(chargeNumber, outcomeDetails)
  }

  async removeReferral(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).removeReferral(chargeNumber)
  }

  async removeNotProceedOrQuashed(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).removeNotProceedOrQuashed(chargeNumber)
  }

  async removeAdjournOutcome(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsUserTokensClient(user).removeAdjourn(chargeNumber)
  }

  async createPoliceReferral(chargeNumber: string, details: string, user: User): Promise<ReportedAdjudicationResult> {
    const outcomeDetails = {
      code: OutcomeCode.REFER_POLICE,
      details,
    }
    return new ManageAdjudicationsUserTokensClient(user).createPoliceReferral(chargeNumber, outcomeDetails)
  }

  async editPoliceReferralOutcome(
    chargeNumber: string,
    referralReason: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details: referralReason,
    }
    return new ManageAdjudicationsUserTokensClient(user).amendOutcome(chargeNumber, data)
  }

  async quashAGuiltyFinding(
    chargeNumber: string,
    quashReason: QuashGuiltyFindingReason,
    quashDetails: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details: quashDetails,
      reason: quashReason,
    }
    return new ManageAdjudicationsUserTokensClient(user).quashOutcome(chargeNumber, data)
  }

  async editNotProceedOutcome(
    chargeNumber: string,
    notProceedReason: NotProceedReason,
    details: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details,
      reason: notProceedReason,
    }
    return new ManageAdjudicationsUserTokensClient(user).amendOutcome(chargeNumber, data)
  }

  async editQuashedOutcome(
    chargeNumber: string,
    quashReason: QuashGuiltyFindingReason,
    quashDetails: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details: quashDetails,
      quashedReason: quashReason,
    }
    return new ManageAdjudicationsUserTokensClient(user).amendOutcome(chargeNumber, data)
  }
}
