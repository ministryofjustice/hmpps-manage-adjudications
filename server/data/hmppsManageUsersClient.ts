import querystring from 'querystring'

import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import { ActiveCaseLoad } from '../@types/template'

export interface User {
  username: string
  name: string
  activeCaseLoadId: string
  token: string
  authSource: string
  userId?: string
  meta?: ActiveCaseLoad
}

export interface UserRole {
  roleCode: string
}

export type NomisUserResponse = {
  content: NomisUserResult[]
}

export type NomisUserResult = {
  username: string
  email: string
  firstName: string
  lastName: string
}

export type UserEmail = {
  username: string
  email: string
  verified: boolean
}

export default class HmppsManageUsersClient {
  private restClient(token: string): RestClient {
    return new RestClient('HMPPS Manage Users Client', config.apis.hmppsManageUsers, token)
  }

  getUser(token: string): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Manage Users`)
    return this.restClient(token).get({ path: '/users/me' })
  }

  async getUserFromUsername(username: string, token: string): Promise<User | null> {
    try {
      return await this.restClient(token).get({ path: `/users/${username}` })
    } catch (error) {
      logger.error(`Error fetching user "${username}": ${error.message}`)
      return null
    }
  }

  getUsersFromName(name: string, token: string): Promise<NomisUserResponse> {
    return this.restClient(token).get({
      path: `/users/search`,
      query: querystring.stringify({ name: name?.trim(), authSources: ['nomis'] }),
    })
  }

  getUserEmail(username: string, token: string): Promise<UserEmail> {
    return this.restClient(token).get({ path: `/users/${username}/email` })
  }

  getUserRoles(token: string): Promise<string[]> {
    return this.restClient(token)
      .get({ path: '/users/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode)) as Promise<string[]>
  }
}
