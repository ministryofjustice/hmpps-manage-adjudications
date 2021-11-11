import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import ManageAdjudicationsClient from '../data/manageAdjudicationsClient'
import { CompletedAdjudicationSummary } from '../data/CompletedAdjudicationsData'
import { PageResponse } from '../utils/PageResponse'
import PageRequest from '../utils/PageRequest'

export default class CompletedAdjudicationsService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getCompletedAdjudications(
    user: User,
    pageRequest: PageRequest
  ): Promise<PageResponse<CompletedAdjudicationSummary>> {
    return new ManageAdjudicationsClient(user.token).getCompletedAdjudications(user, pageRequest)
  }
}
