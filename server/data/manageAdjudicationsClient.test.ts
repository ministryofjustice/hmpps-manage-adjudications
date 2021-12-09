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
        agencyId: 'MDI',
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

  describe('getReportedAdjudication', () => {
    it('should return the reported adjudication data', async () => {
      const result = {
        reportedAdjudication: {
          adjudicationNumber: 3,
          prisonerNumber: 'A12345',
          bookingId: 123,
          dateTimeReportExpires: '2020-12-12T10:00:00',
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
        .get('/reported-adjudications/3')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const response = await client.getReportedAdjudication(3)

      expect(response).toEqual(result)
    })
  })

  describe('getDraftAdjudication', () => {
    it('should return the draft adjudication data', async () => {
      const result = {
        draftAdjudication: {
          id: 10,
          prisonerNumber: 'G6123VU',
          incidentDetails: {
            locationId: 26152,
            dateTimeOfIncident: '2021-11-04T07:20:00',
          },
          incidentStatement: {
            id: 9,
            statement: 'test',
          },
          createdByUserId: 'NCLAMP_GEN',
          createdDateTime: '2021-11-04T09:21:21.95935',
          startedByUserId: 'NCLAMP_GEN',
        },
      }

      fakeManageAdjudicationsApi
        .get('/draft-adjudications/10')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const response = await client.getDraftAdjudication(10)

      expect(response).toEqual(result)
    })
  })

  describe('submitCompleteDraftAdjudication', () => {
    const result = {
      reportedAdjudication: {
        adjudicationNumber: 2345221,
        prisonerNumber: 'G6123VU',
        dateTimeReportExpires: '2021-11-06T09:21:00.00',
        incidentDetails: {},
        incidentStatement: {},
      },
    }
    it('should return reported adjudication after posting the complete draft adjudication to NOMIS', async () => {
      fakeManageAdjudicationsApi
        .post('/draft-adjudications/16/complete-draft-adjudication')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(201, result)

      const response = await client.submitCompleteDraftAdjudication(16)
      expect(response).toEqual(result)
    })
  })

  describe('editDraftIncidentDetails', () => {
    const result = {
      reportedAdjudication: {
        adjudicationNumber: 2345221,
        prisonerNumber: 'G6123VU',
        incidentDetails: {},
        incidentStatement: {},
      },
    }

    const editedDetails = {
      dateTimeOfIncident: '2021-11-04T09:21:00.00',
      locationId: 23424,
    }
    it('should return a draft adjudication', async () => {
      fakeManageAdjudicationsApi
        .put(`/draft-adjudications/16/incident-details`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const response = await client.editDraftIncidentDetails(16, editedDetails)
      expect(response).toEqual(result)
    })
  })

  describe('getAllDraftAdjudicationsForUser', () => {
    const result = {
      draftAdjudications: [
        {
          createdByUserId: 'string',
          createdDateTime: '2021-11-16T14:15:08.021Z',
          startedByUserId: 'string',
          id: 1,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-16T14:15:08.021Z',
            locationId: 23444,
          },
          incidentStatement: {
            completed: true,
            statement: 'string',
          },
          prisonerNumber: 'G2996UX',
        },
        {
          createdByUserId: 'string',
          createdDateTime: '2021-11-16T15:12:08.021Z',
          startedByUserId: 'string',
          id: 2,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-16T12:30:00.000Z',
            locationId: 1335,
          },
          prisonerNumber: 'G2296UP',
        },
      ],
    }
    it('should return a list of all the draft reports provided by the API', async () => {
      fakeManageAdjudicationsApi
        .get(`/draft-adjudications/my/agency/MDI`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const response = await client.getAllDraftAdjudicationsForUser('MDI')
      expect(response).toEqual(result)
    })
  })
  describe('getYourCompletedAdjudications', () => {
    const content = [
      {
        adjudicationNumber: 2,
        prisonerNumber: 'G6123VU',
        bookingId: 2,
        dateTimeReportExpires: '2021-11-17T11:45:00',
        incidentDetails: {
          locationId: 3,
          dateTimeOfIncident: '2021-11-15T11:45:00',
        },
        incidentStatement: {
          statement: 'My second incident',
        },
      },
      {
        adjudicationNumber: 1,
        prisonerNumber: 'G6174VU',
        bookingId: 1,
        dateTimeReportExpires: '2021-11-17T11:30:00',
        incidentDetails: {
          locationId: 3,
          dateTimeOfIncident: '2021-11-15T11:30:00',
        },
        incidentStatement: {
          statement: 'My first incident',
        },
      },
    ]
    const request = {
      size: 20,
      number: 0,
    }
    const response = {
      size: 20,
      pageNumber: 0,
      totalElements: 2,
      content,
    }

    it('should return a page of completed adjudications', async () => {
      fakeManageAdjudicationsApi
        .get(`/reported-adjudications/my/agency/MDI?page=0&size=20`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response)

      const result = await client.getYourCompletedAdjudications('MDI', request)
      expect(result).toEqual(response)
    })
  })

  describe('getAllCompletedAdjudications', () => {
    const content = [
      {
        adjudicationNumber: 2,
        prisonerNumber: 'G6123VU',
        bookingId: 2,
        dateTimeReportExpires: '2021-11-17T11:45:00',
        incidentDetails: {
          locationId: 3,
          dateTimeOfIncident: '2021-11-15T11:45:00',
        },
        incidentStatement: {
          statement: 'My second incident',
        },
      },
      {
        adjudicationNumber: 1,
        prisonerNumber: 'G6174VU',
        bookingId: 1,
        dateTimeReportExpires: '2021-11-17T11:30:00',
        incidentDetails: {
          locationId: 3,
          dateTimeOfIncident: '2021-11-15T11:30:00',
        },
        incidentStatement: {
          statement: 'My first incident',
        },
      },
    ]
    const request = {
      size: 20,
      number: 0,
    }
    const response = {
      size: 20,
      pageNumber: 0,
      totalElements: 2,
      content,
    }

    it('should return a page of completed adjudications', async () => {
      fakeManageAdjudicationsApi
        .get(`/reported-adjudications/agency/MDI?page=0&size=20`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response)

      const result = await client.getAllCompletedAdjudications('MDI', request)
      expect(result).toEqual(response)
    })
  })
  describe('createDraftFromCompleteAdjudication', () => {
    it('return a new draft with the details of the completed adjudication', async () => {
      const result = {
        draftAdjudication: {
          id: 177,
          prisonerNumber: 'A7820DY',
          incidentDetails: {
            locationId: 26142,
            dateTimeOfIncident: '2021-12-01T09:40:00',
            handoverDeadline: '2021-12-03T09:40:00',
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-12-02T14:36:29.786185082',
            modifiedByUserId: 'TEST_GEN',
            modifiedByDateTime: '2021-12-02T14:36:29.786185082',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
            createdByUserId: 'TEST_GEN',
            createdDateTime: '2021-12-02T14:36:29.788815896',
            modifiedByUserId: 'TEST_GEN',
            modifiedByDateTime: '2021-12-02T14:36:29.788815896',
          },
          createdByUserId: 'TEST_GEN',
          createdDateTime: '2021-12-02T14:36:29.786055469',
          startedByUserId: 'TEST_GEN',
        },
      }

      fakeManageAdjudicationsApi
        .post('/reported-adjudications/12347/create-draft-adjudication')
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)

      const response = await client.createDraftFromCompleteAdjudication(12347)
      expect(response).toEqual(result)
      expect(response.draftAdjudication.prisonerNumber).toEqual('A7820DY')
      expect(response.draftAdjudication.incidentDetails.dateTimeOfIncident).toEqual('2021-12-01T09:40:00')
      expect(response.draftAdjudication.incidentStatement.statement).toEqual('TESTING')
      expect(response.draftAdjudication.incidentDetails.locationId).toEqual(26142)
    })
  })
})
