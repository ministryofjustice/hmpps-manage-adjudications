import nock from 'nock'

import config from '../config'
import HmppsAuthClient from './hmppsAuthClient'
import TokenStore from './tokenStore'

jest.mock('./tokenStore')

const tokenStore = new TokenStore(null) as jest.Mocked<TokenStore>

const username = 'Bob'
const token = { access_token: 'token-1', expires_in: 300 }

describe('hmppsAuthClient', () => {
  let fakeHmppsAuthApi: nock.Scope
  let hmppsAuthClient: HmppsAuthClient

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    hmppsAuthClient = new HmppsAuthClient(tokenStore)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeHmppsAuthApi
        .get('/api/user/me')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthClient.getUser(token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUserRoles', () => {
    it('should return data from api', async () => {
      fakeHmppsAuthApi
        .get('/api/user/me/roles')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, [{ roleCode: 'role1' }, { roleCode: 'role2' }])

      const output = await hmppsAuthClient.getUserRoles(token.access_token)
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

      fakeHmppsAuthApi
        .get('/api/user/DEMO_USER1')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthClient.getUserFromUsername('DEMO_USER1', token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getUsersFromName', () => {
    const response = {
      email: 'bsmith@justice.gov.uk',
      firstName: 'Bob',
      lastName: 'Smith',
      name: 'Bob Smith',
      username: 'BSMITH_GEN',
    }
    it('should return data from api', async () => {
      fakeHmppsAuthApi
        .get('/api/prisonuser?firstName=bob&lastName=smith')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthClient.getUsersFromName('bob', 'smith', token.access_token)
      expect(output).toEqual(response)
    })
    it('should trim the names', async () => {
      fakeHmppsAuthApi
        .get('/api/prisonuser?firstName=bob&lastName=smith')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthClient.getUsersFromName('   bob  ', '  smith', token.access_token)
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

      fakeHmppsAuthApi
        .get('/api/user/BSMITH_GEN/email')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const output = await hmppsAuthClient.getUserEmail('BSMITH_GEN', token.access_token)
      expect(output).toEqual(response)
    })
  })

  describe('getSystemClientToken', () => {
    it('should instantiate the redis client', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      await hmppsAuthClient.getSystemClientToken(username)
    })

    it('should return token from redis if one exists', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      const output = await hmppsAuthClient.getSystemClientToken(username)
      expect(output).toEqual(token.access_token)
    })

    it('should return token from HMPPS Auth with username', async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials&username=Bob')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken(username)

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toBeCalledWith('Bob', token.access_token, 240)
    })

    it('should return token from HMPPS Auth without username', async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await hmppsAuthClient.getSystemClientToken()

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toBeCalledWith('%ANONYMOUS%', token.access_token, 240)
    })
  })
})
