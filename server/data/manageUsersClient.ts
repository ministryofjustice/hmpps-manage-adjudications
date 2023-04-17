import querystring from 'querystring'
import RestClient from './restClient'
import config from '../config'

export type ManageUserResult = {
  username: string
  email: string
  firstName: string
  lastName: string
}

export default class ManageUsersClient {
  private restClient(token: string): RestClient {
    return new RestClient('Manage Users Client', config.apis.manageUsers, token)
  }

  getUsersFromName(name: string, token: string): Promise<ManageUserResult[]> {
    return this.restClient(token).get({
      path: `/externalusers/search`,
      query: querystring.stringify({ name: name?.trim() }),
    })
  }
}
