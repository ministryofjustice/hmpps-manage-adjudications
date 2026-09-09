import { jwtDecode } from 'jwt-decode'
import { Request } from 'express'
import { convertToTitleCase, hasAnyRole } from '../utils/utils'
import HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient, { CaseLoad } from '../data/prisonApiClient'
import HmppsManageUsersClient, { type User } from '../data/hmppsManageUsersClient'
import type { ApiPageRequest, ApiPageResponse } from '../data/ApiData'

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

export const isCentralAdminCaseload = (caseloadId: string): boolean => {
  return caseloadId === 'CADM_I'
}

export default class UserService {
  constructor(
    private readonly hmppsAuthClient: HmppsAuthClient,
    private readonly hmppsManageUsersClient: HmppsManageUsersClient,
  ) {}

  async getUserRoles(token: string): Promise<string[]> {
    const { authorities: roles = [] } = jwtDecode(token) as { authorities?: string[] }

    return roles.map(role => role.replace('ROLE_', ''))
  }

  async isUserALO(user: User): Promise<boolean> {
    const userRoles = await this.getUserRoles(user.token)
    return hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)
  }

  async getUserWithSession(req: Request, token: string): Promise<UserDetails> {
    if (!req.session.userDetails) {
      req.session.userDetails = await this.getUser(token)
    }
    return req.session.userDetails
  }

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsManageUsersClient.getUser(token)
    const allCaseLoads = await new PrisonApiClient(token).getUserCaseLoads()

    return {
      ...user,
      displayName: convertToTitleCase(user.name as string),
      allCaseLoads,
      activeCaseLoad: allCaseLoads.find((caseLoad: CaseLoad) => caseLoad.currentlyActive),
    }
  }

  async getStaffFromUsername(username: string, user: User): Promise<UserWithEmail> {
    if (!username) return null
    const [result, userEmail] = await Promise.all([
      this.hmppsManageUsersClient.getUserFromUsername(username, user.token),
      this.hmppsManageUsersClient.getUserEmail(username, user.token),
    ])
    return { ...result, email: userEmail.email }
  }

  async getStaffNameFromUsername(username: string, user: User): Promise<User> {
    return this.hmppsManageUsersClient.getUserFromUsername(username, user.token)
  }

  async getStaffFromNames(
    name: string,
    user: User,
    pageRequest: ApiPageRequest,
  ): Promise<ApiPageResponse<StaffSearchByName>> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)

    const users = await this.hmppsManageUsersClient.getUsersFromName(name, token, pageRequest)

    const result: ApiPageResponse<StaffSearchByName> = {
      ...users,
      content: users.content.map(prisonUser => {
        return {
          username: prisonUser.username,
          firstName: prisonUser.firstName,
          lastName: prisonUser.lastName,
          name: `${prisonUser.firstName} ${prisonUser.lastName}`,
          email: prisonUser.email,
          activeCaseLoadId: prisonUser.activeCaseload?.id,
          staffId: prisonUser.staffId,
          verified: true,
        }
      }),
    }

    return result
  }
}
