import nock from 'nock'

import config from '../config'
import HmppsManageUsersClient from './hmppsManageUsersClient'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('hmppsManangeUsersClient', () => {
  let fakeManangeUsersUrl: nock.Scope
  let hmppsManangeUsersClient: HmppsManageUsersClient

  beforeEach(() => {
    fakeManangeUsersUrl = nock(config.apis.hmppsManageUsers.url)
    hmppsManangeUsersClient = new HmppsManageUsersClient()
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeManangeUsersUrl
        .get('/users/me')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsManangeUsersClient.getUser(token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUserRoles', () => {
    it('should return data from api', async () => {
      fakeManangeUsersUrl
        .get('/users/me/roles')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [{ roleCode: 'role1' }, { roleCode: 'role2' }])

      const output = await hmppsManangeUsersClient.getUserRoles(token.access_token)
      expect(output).toEqual(['role1', 'role2'])
    })
  })

  describe('getUserFromUsername', () => {
    it('should return data from api', async () => {
      const response = {
        username: 'DEMO_USER1',
        active: false,
        name: 'John Smith',
        authSource: 'nomis',
        staffId: 231232,
        activeCaseLoadId: 'MDI',
        userId: 231232,
        uuid: '5105a589-75b3-4ca0-9433-b96228c1c8f3',
      }

      fakeManangeUsersUrl
        .get('/users/DEMO_USER1')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsManangeUsersClient.getUserFromUsername('DEMO_USER1', token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUsersFromName', () => {
    const prisonUser = {
      email: 'bsmith@justice.gov.uk',
      firstName: 'Bob',
      lastName: 'Smith',
      // name: 'Bob Smith',
      username: 'BSMITH_GEN',
      staffId: 1234,
      activeCaseload: {
        id: 'WWI',
        name: 'WANDSWORTH (HMP)',
      },
    }
    const response = {
      content: [prisonUser],
      totalElements: 1,
      number: 0,
      size: 20,
    }

    it('returns data from api', async () => {
      fakeManangeUsersUrl
        .get('/prisonusers/search?nameFilter=bob%20smith&status=ACTIVE&page=0&size=20')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsManangeUsersClient.getUsersFromName('bob smith', token.access_token, {
        number: 0,
        size: 20,
      })
      expect(output).toEqual(response)
    })

    it('trims the names', async () => {
      fakeManangeUsersUrl
        .get('/prisonusers/search?nameFilter=bob%20smith&status=ACTIVE&page=0&size=20')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsManangeUsersClient.getUsersFromName('bob smith  ', token.access_token, {
        number: 0,
        size: 20,
      })
      expect(output).toEqual(response)
    })
  })

  describe('getUserEmail', () => {
    it('should return data from api', async () => {
      const response = {
        username: 'BSMITH_GEN',
        email: 'bob.smith@digital.justice.gov.uk',
        verified: true,
      }

      fakeManangeUsersUrl
        .get('/users/BSMITH_GEN/email')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsManangeUsersClient.getUserEmail('BSMITH_GEN', token.access_token)
      expect(output).toEqual(response)
    })
  })
})
