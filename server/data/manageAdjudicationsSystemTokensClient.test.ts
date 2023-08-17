import nock from 'nock'
import moment from 'moment'
import config from '../config'
import ManageAdjudicationsSystemTokensClient from './manageAdjudicationsSystemTokensClient'
import { ReportedAdjudicationStatus } from './ReportedAdjudicationResult'
import { DamageCode, EvidenceCode, PrisonerGender } from './DraftAdjudicationResult'
import TestData from '../routes/testutils/testData'

jest.mock('../../logger')
const testData = new TestData()

describe('manageAdjudicationsSystemTokensClient', () => {
  let fakeManageAdjudicationsApi: nock.Scope
  let client: ManageAdjudicationsSystemTokensClient

  const token = 'token-1'
  const user = {
    token,
    username: '',
    name: '',
    activeCaseLoadId: '',
    authSource: '',
  }

  beforeEach(() => {
    fakeManageAdjudicationsApi = nock(config.apis.adjudications.url)
    client = new ManageAdjudicationsSystemTokensClient(token, user)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getYourCompletedAdjudications', () => {
    const content = [
      testData.reportedAdjudication({
        chargeNumber: '2',
        prisonerNumber: 'G6123VU',
      }),
      testData.reportedAdjudication({
        chargeNumber: '1',
        prisonerNumber: 'G6174VU',
      }),
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
          `/reported-adjudications/my-reports?page=0&size=20&startDate=2022-01-01&endDate=2022-01-01&status=AWAITING_REVIEW`
        )
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, response)

      const result = await client.getYourCompletedAdjudications(
        {
          toDate: moment('2022-01-01', 'YYYY-MM-DD'),
          fromDate: moment('2022-01-01', 'YYYY-MM-DD'),
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
          transfersOnly: false,
        },
        request
      )
      expect(result).toEqual(response)
    })
  })

  describe('startNewDraftAdjudication', () => {
    it('should return the new draft adjudication', async () => {
      const result = {
        draftAdjudication: testData.draftAdjudication({
          id: 1,
          prisonerNumber: 'G2996UX',
          dateTimeOfIncident: '2021-10-28T15:40:25.884',
          locationId: 2,
          incidentRole: {
            roleCode: '25b',
            associatedPrisonersNumber: 'B2345BB',
          },
        }),
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
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
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
        draftAdjudication: testData.draftAdjudication({
          id: 4,
          prisonerNumber: 'A12345',
          locationId: 2,
          incidentStatement: {
            statement: 'test',
          },
        }),
      }

      const content = { statement: 'test' }

      fakeManageAdjudicationsApi
        .post('/draft-adjudications/4/incident-statement', content)
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, result)

      const response = await client.postDraftIncidentStatement(4, content)

      expect(response).toEqual(result)
      expect(response.draftAdjudication.incidentStatement.statement).toEqual('test')
    })
  })

  describe('getReportedAdjudication', () => {
    it('should return the reported adjudication data', async () => {
      const result = {
        reportedAdjudication: testData.reportedAdjudication({
          chargeNumber: '3',
          prisonerNumber: 'A12345',
          status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        }),
      }

      fakeManageAdjudicationsApi
        .get('/reported-adjudications/3/v2')
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, result)

      const response = await client.getReportedAdjudication('3')

      expect(response).toEqual(result)
    })
  })

  describe('getDraftAdjudication', () => {
    it('should return the draft adjudication data', async () => {
      const result = {
        draftAdjudication: testData.draftAdjudication({
          id: 10,
          prisonerNumber: 'G6123VU',
        }),
      }

      fakeManageAdjudicationsApi
        .get('/draft-adjudications/10')
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, result)

      const response = await client.getDraftAdjudication(10)

      expect(response).toEqual(result)
    })
  })

  describe('submitCompleteDraftAdjudication', () => {
    const result = {
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber: '2345221',
        prisonerNumber: 'G6123VU',
      }),
    }
    it('should return reported adjudication after posting the complete draft adjudication to NOMIS', async () => {
      fakeManageAdjudicationsApi
        .post('/draft-adjudications/16/complete-draft-adjudication')
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(201, result)

      const response = await client.submitCompleteDraftAdjudication(16)
      expect(response).toEqual(result)
    })
  })

  describe('editDraftIncidentDetails', () => {
    const result = {
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber: '2345221',
        prisonerNumber: 'G6123VU',
      }),
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
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, result)

      const response = await client.editDraftIncidentDetails(16, editedDetails)
      expect(response).toEqual(result)
    })
  })

  describe('getAllDraftAdjudicationsForUser', () => {
    const content = [
      testData.draftAdjudication({
        dateTimeOfIncident: '2021-11-16T14:15:08.021Z',
        prisonerNumber: 'G2996UX',
        id: 1,
      }),
      testData.draftAdjudication({
        dateTimeOfIncident: '2021-11-16T12:30:00.000Z',
        prisonerNumber: 'G2296UP',
        id: 2,
      }),
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

    it('should return a list of all the draft reports provided by the API', async () => {
      fakeManageAdjudicationsApi
        .get(`/draft-adjudications/my-reports?page=0&size=20&startDate=2021-11-16&endDate=2021-11-21`)
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, response)

      const result = await client.getAllDraftAdjudicationsForUser(
        {
          fromDate: moment('16/11/2021', 'DD/MM/YYYY'),
          toDate: moment('21/11/2021', 'DD/MM/YYYY'),
        },
        request
      )
      expect(response).toEqual(result)
    })
  })
  describe('createDraftFromCompleteAdjudication', () => {
    it('return a new draft with the details of the completed adjudication', async () => {
      const result = {
        draftAdjudication: testData.draftAdjudication({
          id: 177,
          prisonerNumber: 'A7820DY',
          dateTimeOfIncident: '2021-12-01T09:40:00',
          locationId: 26142,
          incidentRole: {
            roleCode: '25b',
            associatedPrisonersNumber: 'B2345BB',
          },
          incidentStatement: {
            statement: 'TESTING',
            completed: true,
          },
        }),
      }

      fakeManageAdjudicationsApi
        .post('/reported-adjudications/12347/create-draft-adjudication')
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, result)

      const response = await client.createDraftFromCompleteAdjudication('12347')
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
      draftAdjudication: testData.draftAdjudication({
        id: 2469,
        prisonerNumber: 'G6123VU',
        isYouthOffender: true,
      }),
    }

    const youthOffenderData = {
      isYouthOffenderRule: true,
      removeExistingOffences: true,
    }
    it('returns the updated draft adjudication', async () => {
      fakeManageAdjudicationsApi
        .put(`/draft-adjudications/2469/applicable-rules`)
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
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
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, result)
      const response = await client.getOffenceRule(1234, true, PrisonerGender.MALE)
      expect(response).toEqual(result)
    })
  })
  describe('saveDamageDetails', () => {
    const result = {
      draftAdjudication: testData.draftAdjudication({
        id: 2469,
        prisonerNumber: 'G6123VU',
        damages: [
          testData.singleDamage({
            code: DamageCode.REPLACE_AN_ITEM,
            details: 'Lightbulb was smashed',
            reporter: 'TESTER_GEN',
          }),
        ],
      }),
    }

    const damagesData = [
      testData.singleDamage({
        code: DamageCode.REPLACE_AN_ITEM,
        details: 'Lightbulb was smashed',
        reporter: 'TESTER_GEN',
      }),
    ]
    it('returns the updated draft adjudication', async () => {
      fakeManageAdjudicationsApi
        .put(`/draft-adjudications/2469/damages`)
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, result)
      const response = await client.saveDamageDetails('2469', damagesData)
      expect(response).toEqual(result)
    })
  })
  describe('saveEvidenceDetails', () => {
    const result = {
      draftAdjudication: testData.draftAdjudication({
        id: 2469,
        prisonerNumber: 'G6123VU',
        evidence: [
          testData.singleEvidence({
            code: EvidenceCode.PHOTO,
          }),
          testData.singleEvidence({
            identifier: 'BWC: 123456',
          }),
        ],
      }),
    }

    const evidenceData = [
      {
        code: EvidenceCode.PHOTO,
        details: 'Some details here',
        reporter: 'user1',
      },
      {
        code: EvidenceCode.BODY_WORN_CAMERA,
        details: 'Some details here',
        reporter: 'user1',
        identifier: 'BWC: 123456',
      },
    ]
    it('returns the updated draft adjudication', async () => {
      fakeManageAdjudicationsApi
        .put(`/draft-adjudications/2469/evidence`)
        .matchHeader('authorization', `Bearer ${token}`)
        .matchHeader('Active-Caseload', user.activeCaseLoadId)
        .reply(200, result)
      const response = await client.saveEvidenceDetails('2469', evidenceData)
      expect(response).toEqual(result)
    })
  })
})
