import superagent from 'superagent'
import querystring from 'querystring'
import type TokenStore from './tokenStore'

import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import RestClient from './restClient'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret
  )

  const authRequest = username
    ? querystring.stringify({ grant_type: 'client_credentials', username })
    : querystring.stringify({ grant_type: 'client_credentials' })

  logger.info(
    `HMPPS Auth request '${authRequest}' for client id '${config.apis.hmppsAuth.systemClientId}' and user '${username}'`
  )

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(authRequest)
    .timeout(timeoutSpec)
}

export interface User {
  username: string
  name: string
  activeCaseLoadId: string
  token: string
  authSource: string
}

export interface UserRole {
  roleCode: string
}

export type MatchedUserResult = {
  exists: boolean
  username: string
  verified: boolean
  email?: string
  name: string
  activeCaseLoadId?: string
  staffId: number
}

export type UserEmail = {
  username: string
  email: string
  verified: boolean
}

export default class HmppsAuthClient {
  constructor(private readonly tokenStore: TokenStore) {}

  private restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  getUser(token: string): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Auth`)
    return this.restClient(token).get({ path: '/api/user/me' })
  }

  getUserFromUsername(username: string, token: string): Promise<User> {
    return this.restClient(token).get({ path: `/api/user/${username}` })
  }

  getUsersFromName(firstName: string, lastName: string, token: string): Promise<MatchedUserResult[]> {
    return this.restClient(token).get({
      path: `/api/prisonuser`,
      query: querystring.stringify({ firstName: firstName?.trim(), lastName: lastName?.trim() }),
    })
  }

  getUserEmail(username: string, token: string): Promise<UserEmail> {
    return this.restClient(token).get({ path: `/api/user/${username}/email` })
  }

  getUserRoles(token: string): Promise<string[]> {
    return this.restClient(token)
      .get({ path: '/api/user/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode)) as Promise<string[]>
  }

  async getSystemClientToken(username?: string): Promise<string> {
    const key = username || '%ANONYMOUS%'

    const token = await this.tokenStore.getToken(key)
    if (token) {
      return token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(username)

    // set TTL slightly less than expiry of token. Async but no need to wait
    await this.tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)

    return newToken.body.access_token
  }
}
