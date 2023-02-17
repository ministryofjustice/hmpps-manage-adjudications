import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { OutcomeCode } from '../data/OutcomeResult'
import { ReportedAdjudicationResult } from '../data/ReportedAdjudicationResult'

export default class OutcomesService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async createProsecution(adjudicationNumber: number, user: User): Promise<ReportedAdjudicationResult> {
    const outcomeDetails = {
      code: OutcomeCode.PROSECUTION,
    }
    return new ManageAdjudicationsClient(user.token).createOutcome(adjudicationNumber, outcomeDetails)
  }
}
