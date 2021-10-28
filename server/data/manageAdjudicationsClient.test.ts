import nock from 'nock'
import config from '../config'
import ManageAdjudicationsClient from './manageAdjudicationsClient'

jest.mock('../../logger')

describe('manageAdjudicationsClient', () => {
  let fakeManageAdjudicationsApi: nock.Scope
  let client: ManageAdjudicationsClient

  const token = 'token-1'

  beforeEach(() => {
    fakeManageAdjudicationsApi = nock(config.apis.adjudications.url)
    client = new ManageAdjudicationsClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('addDraftAdjudicationIncidentStatement', () => {
    it('should return only the neccessary prisoner details', async () => {
      const result = {
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          adjudicationSent: false,
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      }
      fakeManageAdjudicationsApi
        .post('/draft-adjudications/4/incident-statement')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const response = await client.addDraftAdjudicationIncidentStatement(4, { statement: '' })

      expect(response).toEqual({
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          adjudicationSent: false,
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      })
    })
  })
})
