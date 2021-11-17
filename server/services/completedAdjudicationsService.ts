import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { PageResponse } from '../utils/pageResponse'
import PageRequest from '../utils/pageRequest'
import { ReportedAdjudication } from '../data/ReportedAdjudicationResult'
import PrisonApiClient from '../data/prisonApiClient'

export default class CompletedAdjudicationsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getCompletedAdjudications(user: User, pageRequest: PageRequest): Promise<PageResponse<ReportedAdjudication>> {
    const x = await new ManageAdjudicationsClient(user.token).getCompletedAdjudications(
      user.activeCaseLoadId,
      pageRequest
    )
    const y = await new ManageAdjudicationsClient(user.token).getCompletedAdjudications(
      user.activeCaseLoadId,
      pageRequest
    )
    const z = await new PrisonApiClient(user.token).getPrisonerDetails('G9967VP')
    const zz = await new PrisonApiClient(user.token).getBatchPrisonerDetails(['G9967VP'])
    return x
  }
}
