import { convertToTitleCase } from '../utils/utils'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient, { CaseLoad } from '../data/prisonApiClient'

interface UserDetails {
  name: string
  displayName: string
  allCaseLoads: CaseLoad[] | string[]
  activeCaseLoad: CaseLoad
}

export interface StaffDetails {
  activeCaseLoadId?: string
  email?: string
  firstName?: string
  lastName?: string
  name: string
  staffId: number
  username: string
  verified?: boolean
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUserRoles(token: string): Promise<string[]> {
    return this.hmppsAuthClient.getUserRoles(token)
  }

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

  async getStaffFromUsername(username: string, user: User): Promise<User> {
    return this.hmppsAuthClient.getUserFromUsername(username, user.token)
  }

  async getStaffFromNames(firstName: string, lastName: string, user: User): Promise<StaffDetails[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return this.hmppsAuthClient.getUsersFromName(firstName, lastName, token)
  }
}
