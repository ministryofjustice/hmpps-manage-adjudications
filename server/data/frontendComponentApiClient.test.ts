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
      const expectedResponse = {
        header: frontEndComponentHeader(),
        footer: frontEndComponentFooter(),
      }
      fakeFrontendComponentApi
        .get('/components?component=header&component=footer')
        .matchHeader('x-user-token', userToken)
        .reply(200, expectedResponse)
      const actual = await frontendComponentApiClient.getComponents(['header', 'footer'], userToken)
      expect(actual).toEqual(expectedResponse)
      expect(nock.isDone()).toBe(true)
    })
  })
})
