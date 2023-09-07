import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'
import DecisionTreeService from '../../services/decisionTreeService'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import CheckOnBehalfOfSessionService from './checkOnBehalfOfSessionService'

jest.mock('../../services/decisionTreeService.ts')
jest.mock('./checkOnBehalfOfSessionService.ts')

const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>
const checkOnBehalfOfSessionService = new CheckOnBehalfOfSessionService() as jest.Mocked<CheckOnBehalfOfSessionService>
const testData = new TestData()

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { decisionTreeService, checkOnBehalfOfSessionService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /create-on-behalf-of/reason', () => {
  beforeEach(() => {
    decisionTreeService.draftAdjudicationIncidentData.mockResolvedValue({
      draftAdjudication: testData.draftAdjudication({
        id: 100,
        chargeNumber: '1524661',
        prisonerNumber: 'G5512GK',
        dateTimeOfIncident: '2021-03-08T10:45:00',
        offenceDetails: {
          offenceCode: 1002,
          offenceRule: {
            paragraphNumber: '1',
            paragraphDescription: 'Commits any assault',
          },
          victimPrisonersNumber: 'G6123VU',
        },
      }),
      incidentRole: IncidentRole.COMMITTED,
      associatedPrisoner: undefined,
      prisoner: testData.prisonerResultSummary({
        offenderNo: 'G5512GK',
        firstName: 'BOBBY',
        lastName: 'DA SMITH JONES',
        assignedLivingUnitDesc: '1-1-010',
      }),
    })
  })

  it('should load the check page', () => {
    return request(app)
      .get(`${adjudicationUrls.createOnBehalfOf.urls.reason(100)}?createdOnBehalfOfOfficer=some%20officer`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Why are you creating this report for some officer?')
        expect(res.text).toContain('Return to report 100')
      })
  })
})

describe('POST /create-on-behalf-of/reason', () => {
  beforeEach(() => {
    decisionTreeService.draftAdjudicationIncidentData.mockResolvedValue({
      draftAdjudication: testData.draftAdjudication({
        id: 100,
        chargeNumber: '1524661',
        prisonerNumber: 'G5512GK',
        dateTimeOfIncident: '2021-03-08T10:45:00',
        offenceDetails: {
          offenceCode: 1002,
          offenceRule: {
            paragraphNumber: '1',
            paragraphDescription: 'Commits any assault',
          },
          victimPrisonersNumber: 'G6123VU',
        },
      }),
      incidentRole: IncidentRole.COMMITTED,
      associatedPrisoner: undefined,
      prisoner: testData.prisonerResultSummary({
        offenderNo: 'G5512GK',
        firstName: 'BOBBY',
        lastName: 'DA SMITH JONES',
        assignedLivingUnitDesc: '1-1-010',
      }),
    })
  })

  it('should redirect to the check page when the form is submitted', () => {
    return request(app)
      .post(adjudicationUrls.createOnBehalfOf.urls.reason(100))
      .send({ createdOnBehalfOfReason: 'some reason' })
      .expect('Location', adjudicationUrls.createOnBehalfOf.urls.check(100))
  })
})
