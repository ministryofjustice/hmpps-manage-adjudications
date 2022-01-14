/* eslint-disable no-console */
import { convertToTitleCase } from '../utils/utils'
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import PrisonApiClient, { CaseLoad } from '../data/prisonApiClient'

interface UserDetails {
  name: string
  displayName: string
  allCaseLoads: CaseLoad[] | string[]
  activeCaseLoad: CaseLoad
}

export interface StaffSearchByName {
  activeCaseLoadId?: string
  email?: string
  firstName?: string
  lastName?: string
  name: string
  staffId: number
  username: string
  verified?: boolean
}

export interface UserWithEmail extends User {
  email: string
}

export interface StaffDetails {
  activeCaseLoadId: string
  email?: string
  name: string
  username: string
}

// Check if there are any numbers or underscores, which would indicate that the term is not a name
const isIdentifier = (searchTerm: string) => /\d_/.test(searchTerm)

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

  async getStaffFromUsername(username: string, user: User): Promise<UserWithEmail> {
    const [result, userEmail] = await Promise.all([
      this.hmppsAuthClient.getUserFromUsername(username, user.token),
      this.hmppsAuthClient.getUserEmail(username, user.token),
    ])
    return { ...result, email: userEmail.email }
  }

  async getStaffFromNames(name: string, user: User): Promise<StaffSearchByName[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const [firstName, lastName] = name.split(' ')
    return this.hmppsAuthClient.getUsersFromName(firstName, lastName, token)
  }
}
