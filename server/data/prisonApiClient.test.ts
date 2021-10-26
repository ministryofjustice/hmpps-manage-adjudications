import nock from 'nock'
import config from '../config'
import PrisonApiClient from './prisonApiClient'

jest.mock('../../logger')

describe('prisonApiClient', () => {
  let fakePrisonApi: nock.Scope
  let client: PrisonApiClient

  const token = 'token-1'

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prison.url)
    client = new PrisonApiClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getUserCaseLoads', () => {
    it('return the users case loads', async () => {
      const caseLoads = [
        {
          caseLoadId: 'MDI',
          description: 'Moorland',
          type: 'INST',
          caseloadFunction: 'TEST',
          currentlyActive: true,
        },
        {
          caseLoadId: 'LEI',
          description: 'Leeds',
          type: 'INST',
          caseloadFunction: 'TEST',
          currentlyActive: false,
        },
      ]
      fakePrisonApi.get('/api/users/me/caseLoads').matchHeader('authorization', `Bearer ${token}`).reply(200, caseLoads)
      const response = await client.getUserCaseLoads()

      expect(response).toEqual(caseLoads)
    })
  })
})
