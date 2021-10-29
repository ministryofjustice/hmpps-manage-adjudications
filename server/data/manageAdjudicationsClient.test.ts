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

  describe('startNewDraftAdjudication', () => {
    it('should return the new draft adjudication', async () => {
      const result = {
        draftAdjudication: {
          id: 1,
          prisonerNumber: 'G2996UX',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2021-10-28T15:40:25.884',
          },
        },
      }
      const details = {
        locationId: 2,
        dateTimeOfIncident: '2021-10-28T15:40:25.884',
        prisonerNumber: 'G2996UX',
      }

      fakeManageAdjudicationsApi
        .post('/draft-adjudications', details)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const response = await client.startNewDraftAdjudication(details)

      expect(response).toEqual(result)
      expect(response.draftAdjudication.prisonerNumber).toEqual('G2996UX')
      expect(response.draftAdjudication.incidentDetails.dateTimeOfIncident).toEqual('2021-10-28T15:40:25.884')
      expect(response.draftAdjudication.incidentDetails.locationId).toEqual(2)
    })
  })

  describe('postDraftIncidentStatement', () => {
    it('should return only the neccessary prisoner details', async () => {
      const result = {
        draftAdjudication: {
          id: 4,
          prisonerNumber: 'A12345',
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
          },
          incidentStatement: {
            statement: 'test',
          },
        },
      }

      const content = { statement: 'test' }

      fakeManageAdjudicationsApi
        .post('/draft-adjudications/4/incident-statement', content)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const response = await client.postDraftIncidentStatement(4, content)

      expect(response).toEqual(result)
      expect(response.draftAdjudication.incidentStatement.statement).toEqual('test')
    })
  })
})
