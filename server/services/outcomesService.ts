import { NotProceedReason, OutcomeCode, QuashGuiltyFindingReason } from '../data/HearingAndOutcomeResult'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'

export default class OutcomesService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createProsecution(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user).createProsecution(chargeNumber)
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
    return new ManageAdjudicationsClient(user).createNotProceed(chargeNumber, outcomeDetails)
  }

  async removeReferral(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user).removeReferral(chargeNumber)
  }

  async removeNotProceedOrQuashed(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user).removeNotProceedOrQuashed(chargeNumber)
  }

  async removeAdjournOutcome(chargeNumber: string, user: User): Promise<ReportedAdjudicationResult> {
    return new ManageAdjudicationsClient(user).removeAdjourn(chargeNumber)
  }

  async createPoliceReferral(chargeNumber: string, details: string, user: User): Promise<ReportedAdjudicationResult> {
    const outcomeDetails = {
      code: OutcomeCode.REFER_POLICE,
      details,
    }
    return new ManageAdjudicationsClient(user).createPoliceReferral(chargeNumber, outcomeDetails)
  }

  async editPoliceReferralOutcome(
    chargeNumber: string,
    referralReason: string,
    user: User
  ): Promise<ReportedAdjudicationResult> {
    const data = {
      details: referralReason,
    }
    return new ManageAdjudicationsClient(user).amendOutcome(chargeNumber, data)
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
    return new ManageAdjudicationsClient(user).quashOutcome(chargeNumber, data)
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
    return new ManageAdjudicationsClient(user).amendOutcome(chargeNumber, data)
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
    return new ManageAdjudicationsClient(user).amendOutcome(chargeNumber, data)
  }
}
