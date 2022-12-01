import nock from 'nock'
import moment from 'moment'
import config from '../config'
import ManageAdjudicationsClient from './manageAdjudicationsClient'
import { ReportedAdjudicationStatus } from './ReportedAdjudicationResult'
import { DamageCode, EvidenceCode, PrisonerGender } from './DraftAdjudicationResult'

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
          gender: PrisonerGender.MALE,
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2021-10-28T15:40:25.884',
          },
          incidentRole: {
            roleCode: '25b',
            associatedPrisonersNumber: 'B2345BB',
          },
        },
      }
      const details = {
        locationId: 2,
        agencyId: 'MDI',
        dateTimeOfIncident: '2021-10-28T15:40:25.884',
        incidentRole: {
          roleCode: '25b',
          associatedPrisonersNumber: 'B2345BB',
        },
        prisonerNumber: 'G2996UX',
        gender: PrisonerGender.MALE,
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
      expect(response.draftAdjudication.incidentRole.roleCode).toEqual('25b')
      expect(response.draftAdjudication.incidentRole.associatedPrisonersNumber).toEqual('B2345BB')
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
          incidentRole: {
            roleCode: '25c',
            associatedPrisonersNumber: 'B2345BB',
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
          gender: PrisonerGender.MALE,
          bookingId: 123,
          incidentDetails: {
            locationId: 2,
            dateTimeOfIncident: '2020-12-10T10:00:00',
            handoverDeadline: '2020-12-12T10:00:00',
          },
          incidentRole: {
            roleCode: '25c',
            associatedPrisonersNumber: 'B2345BB',
          },
          incidentStatement: {
            statement: 'test',
          },
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
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
          incidentRole: {
            roleCode: '25b',
            associatedPrisonersNumber: 'B2345BB',
          },
          incidentStatement: {
            id: 9,
            statement: 'test',
          },
          startedByUserId: 'TESTER_GEN',
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
        gender: PrisonerGender.MALE,
        incidentDetails: {},
        incidentRole: {},
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
        gender: PrisonerGender.MALE,
        incidentDetails: {},
        incidentRole: {},
        incidentStatement: {},
      },
    }

    const editedDetails = {
      dateTimeOfIncident: '2021-11-04T09:21:00.00',
      locationId: 23424,
      incidentRole: {
        roleCode: '25b',
        associatedPrisonersNumber: 'B2345BB',
      },
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
          startedByUserId: 'string',
          id: 1,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-16T14:15:08.021Z',
            locationId: 23444,
          },
          incidentRole: {
            roleCode: '25a',
          },
          incidentStatement: {
            completed: true,
            statement: 'string',
          },
          prisonerNumber: 'G2996UX',
        },
        {
          startedByUserId: 'string',
          id: 2,
          incidentDetails: {
            dateTimeOfIncident: '2021-11-16T12:30:00.000Z',
            locationId: 1335,
          },
          incidentRole: {},
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
        incidentDetails: {
          locationId: 3,
          dateTimeOfIncident: '2021-01-01T11:45:00',
          handoverDeadline: '2021-01-03T11:45:00',
        },
        incidentRole: {
          roleCode: '25c',
          associatedPrisonersNumber: 'B2345BB',
        },
        incidentStatement: {
          statement: 'My second incident',
        },
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
      },
      {
        adjudicationNumber: 1,
        prisonerNumber: 'G6174VU',
        bookingId: 1,
        incidentDetails: {
          locationId: 3,
          dateTimeOfIncident: '2021-01-01T11:30:00',
          handoverDeadline: '2021-01-01T11:30:00',
        },
        incidentRole: {},
        incidentStatement: {
          statement: 'My first incident',
        },
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
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
        .get(
          `/reported-adjudications/my/agency/MDI?page=0&size=20&startDate=2022-01-01&endDate=2022-01-01&status=AWAITING_REVIEW`
        )
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response)

      const result = await client.getYourCompletedAdjudications(
        'MDI',
        {
          toDate: moment('2022-01-01', 'YYYY-MM-DD'),
          fromDate: moment('2022-01-01', 'YYYY-MM-DD'),
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        },
        request
      )
      expect(result).toEqual(response)
    })
  })

  describe('getAllCompletedAdjudications', () => {
    const content = [
      {
        adjudicationNumber: 2,
        prisonerNumber: 'G6123VU',
        bookingId: 2,
        incidentDetails: {
          locationId: 3,
          dateTimeOfIncident: '2021-11-15T11:45:00',
          handoverDeadline: '2021-11-17T11:45:00',
        },
        incidentRole: {
          roleCode: '25b',
          associatedPrisonersNumber: 'B2345BB',
        },
        incidentStatement: {
          statement: 'My second incident',
        },
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
      },
      {
        adjudicationNumber: 1,
        prisonerNumber: 'G6174VU',
        bookingId: 1,
        incidentDetails: {
          locationId: 3,
          dateTimeOfIncident: '2021-11-15T11:30:00',
          handoverDeadline: '2021-11-17T11:30:00',
        },
        incidentRole: {},
        incidentStatement: {
          statement: 'My first incident',
        },
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
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
        .get(
          `/reported-adjudications/agency/MDI?page=0&size=20&startDate=2021-01-01&endDate=2021-01-01&status=AWAITING_REVIEW`
        )
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, response)

      const result = await client.getAllCompletedAdjudications(
        'MDI',
        {
          fromDate: moment('01/01/2021', 'DD/MM/YYYY'),
          toDate: moment('01/01/2021', 'DD/MM/YYYY'),
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        },
        request
      )
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
          },
          incidentRole: {
            roleCode: '25b',
            associatedPrisonersNumber: 'B2345BB',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
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
      expect(response.draftAdjudication.incidentDetails.locationId).toEqual(26142)
      expect(response.draftAdjudication.incidentRole.roleCode).toEqual('25b')
      expect(response.draftAdjudication.incidentRole.associatedPrisonersNumber).toEqual('B2345BB')
      expect(response.draftAdjudication.incidentStatement.statement).toEqual('TESTING')
    })
  })
  describe('saveYouthOffenderStatus', () => {
    const result = {
      draftAdjudication: {
        id: 2469,
        prisonerNumber: 'G6123VU',
        incidentDetails: {
          locationId: 26964,
          dateTimeOfIncident: '2022-06-16T11:11:00',
          handoverDeadline: '2022-06-18T11:11:00',
        },
        incidentRole: {},
        startedByUserId: 'TESTER_GEN',
        isYouthOffender: true,
      },
    }

    const youthOffenderData = {
      isYouthOffenderRule: true,
      removeExistingOffences: true,
    }
    it('returns the updated draft adjudication', async () => {
      fakeManageAdjudicationsApi
        .put(`/draft-adjudications/2469/applicable-rules`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)
      const response = await client.saveYouthOffenderStatus(2469, youthOffenderData)
      expect(response).toEqual(result)
    })
  })
  describe('getOffenceRule', () => {
    const result = {
      paragraphNumber: '1',
      paragraphDescription: 'A desc',
    }

    it('returns the relevant rules', async () => {
      fakeManageAdjudicationsApi
        .get(`/draft-adjudications/offence-rule/1234?youthOffender=true&gender=MALE`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)
      const response = await client.getOffenceRule(1234, true, PrisonerGender.MALE)
      expect(response).toEqual(result)
    })
  })
  describe('saveDamageDetails', () => {
    const result = {
      draftAdjudication: {
        id: 2469,
        prisonerNumber: 'G6123VU',
        incidentDetails: {
          locationId: 26964,
          dateTimeOfIncident: '2022-06-16T11:11:00',
          handoverDeadline: '2022-06-18T11:11:00',
        },
        incidentRole: {},
        startedByUserId: 'TESTER_GEN',
        isYouthOffender: true,
        damages: [
          {
            code: 'REPLACE_AN_ITEM',
            details: 'Lightbulb was smashed',
            reporter: 'TESTER_GEN',
          },
        ],
      },
    }

    const damagesData = [
      {
        code: DamageCode.REPLACE_AN_ITEM,
        details: 'Lightbulb was smashed',
        reporter: 'TESTER_GEN',
      },
    ]
    it('returns the updated draft adjudication', async () => {
      fakeManageAdjudicationsApi
        .put(`/draft-adjudications/2469/damages`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)
      const response = await client.saveDamageDetails(2469, damagesData)
      expect(response).toEqual(result)
    })
  })
  describe('saveEvidenceDetails', () => {
    const result = {
      draftAdjudication: {
        id: 2469,
        prisonerNumber: 'G6123VU',
        incidentDetails: {
          locationId: 26964,
          dateTimeOfIncident: '2022-06-16T11:11:00',
          handoverDeadline: '2022-06-18T11:11:00',
        },
        incidentRole: {},
        startedByUserId: 'TESTER_GEN',
        isYouthOffender: true,
        evidence: [
          {
            code: 'PHOTO',
            details: 'Photograph showing prisoner smashing lightbulb',
            reporter: 'TESTER_GEN',
          },
          {
            code: 'BODY_WORN_CAMERA',
            details: 'Video evidence of prisoner smashing lightbulb',
            reporter: 'TESTER_GEN',
            identifier: 'BWC: 123456',
          },
        ],
      },
    }

    const evidenceData = [
      {
        code: EvidenceCode.PHOTO,
        details: 'Photograph showing prisoner smashing lightbulb',
        reporter: 'TESTER_GEN',
      },
      {
        code: EvidenceCode.BODY_WORN_CAMERA,
        details: 'Video evidence of prisoner smashing lightbulb',
        reporter: 'TESTER_GEN',
        identifier: 'BWC: 123456',
      },
    ]
    it('returns the updated draft adjudication', async () => {
      fakeManageAdjudicationsApi
        .put(`/draft-adjudications/2469/evidence`)
        .matchHeader('authorization', `Bearer ${token}`)
        .reply(200, result)
      const response = await client.saveEvidenceDetails(2469, evidenceData)
      expect(response).toEqual(result)
    })
  })
})
