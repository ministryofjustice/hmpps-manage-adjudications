/* eslint-disable no-console */
import { Request } from 'express'
import { convertToTitleCase } from '../utils/utils'
import HmppsAuthClient from '../data/hmppsAuthClient'
import PrisonApiClient, { CaseLoad } from '../data/prisonApiClient'
import HmppsManageUsersClient, { NomisUserResult, User } from '../data/hmppsManageUsersClient'

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
    private readonly hmppsManageUsersClient: HmppsManageUsersClient
  ) {}

  async getUserRoles(token: string): Promise<string[]> {
    return this.hmppsManageUsersClient.getUserRoles(token)
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

  getUserDetailsMap = async (nomisUsers: NomisUserResult[], token: string): Promise<Map<string, User>> => {
    const nomisUsernames = nomisUsers.map(nomisUser => nomisUser.username)
    const userDetails =
      (await Promise.all(
        [...nomisUsernames].map(username => this.hmppsManageUsersClient.getUserFromUsername(username, token))
      )) || []
    return new Map(userDetails.map(details => [details.username, details]))
  }

  async getStaffFromNames(name: string, user: User): Promise<StaffSearchByName[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    const users = await this.hmppsManageUsersClient.getUsersFromName(name, token)

    const userDetailsMapById = await this.getUserDetailsMap(users.content, token)

    return users.content.map(nomisUser => {
      const userDetails = userDetailsMapById.get(nomisUser.username)

      return {
        username: nomisUser.username,
        firstName: nomisUser.firstName,
        lastName: nomisUser.lastName,
        name: `${nomisUser.firstName} ${nomisUser.lastName}`,
        email: nomisUser.email,
        activeCaseLoadId: userDetails.activeCaseLoadId,
        staffId: Number(userDetails.userId),
        verified: true,
      }
    })
  }

  async getNameOfActiveCaseload(user: User): Promise<string> {
    const agency = await new PrisonApiClient(user.token).getAgency(user.activeCaseLoadId)
    return agency.description
  }
}
