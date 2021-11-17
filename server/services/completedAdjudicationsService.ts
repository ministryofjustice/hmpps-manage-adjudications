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
    const prisonNumbers = x.content.map(_ => _.prisonerNumber)
    const y = await new ManageAdjudicationsClient(user.token).getCompletedAdjudications(
      user.activeCaseLoadId,
      pageRequest
    )
    const zz = await new PrisonApiClient(user.token).getBatchPrisonerDetails(prisonNumbers)
    return x
  }
}
