import nock from 'nock'
import config from '../config'
import FrontendComponentApiClient from './frontendComponentApiClient'
import { frontEndComponentHeader, frontEndComponentFooter } from '../test/frontendComponentTestDataBuilder'

jest.mock('../../logger')

describe('frontendComponentApiClient', () => {
  let fakeFrontendComponentApi: nock.Scope
  const frontendComponentApiClient = new FrontendComponentApiClient()

  beforeEach(() => {
    fakeFrontendComponentApi = nock(config.apis.frontendComponents.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getComponent', () => {
    const userToken = 'xyz-token'
    it('should return header data', async () => {
      const expectedResponse = frontEndComponentHeader()
      fakeFrontendComponentApi.get('/header').matchHeader('x-user-token', userToken).reply(200, expectedResponse)
      const actual = await frontendComponentApiClient.getComponent('header', userToken)
      expect(actual).toEqual(expectedResponse)
      expect(nock.isDone()).toBe(true)
    })
    it('should return footer data', async () => {
      const expectedResponse = frontEndComponentFooter()
      fakeFrontendComponentApi.get('/footer').matchHeader('x-user-token', userToken).reply(200, expectedResponse)
      const actual = await frontendComponentApiClient.getComponent('footer', userToken)
      expect(actual).toEqual(expectedResponse)
      expect(nock.isDone()).toBe(true)
    })
  })
})
