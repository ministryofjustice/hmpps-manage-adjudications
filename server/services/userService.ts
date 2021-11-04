import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient, { CaseLoad } from '../data/prisonApiClient'

interface UserDetails {
  name: string
  displayName: string
  allCaseLoads: CaseLoad[] | string[]
  activeCaseLoad: CaseLoad
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    const allCaseLoads = await new PrisonApiClient(token).getUserCaseLoads()

    return {
      ...user,
      displayName: convertToTitleCase(user.name as string),
      allCaseLoads,
      activeCaseLoad: allCaseLoads.find((caseLoad: CaseLoad) => caseLoad.currentlyActive),
    }
  }
}
