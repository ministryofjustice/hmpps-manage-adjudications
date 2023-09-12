import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'
import DecisionTreeService from '../../services/decisionTreeService'
import { IncidentRole } from '../../incidentRole/IncidentRole'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

jest.mock('../../services/decisionTreeService.ts')
jest.mock('../../services/placeOnReportService.ts')
jest.mock('./createOnBehalfOfSessionService.ts')

const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>
const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>
const createOnBehalfOfSessionService =
  new CreateOnBehalfOfSessionService() as jest.Mocked<CreateOnBehalfOfSessionService>
const testData = new TestData()

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, decisionTreeService, createOnBehalfOfSessionService }
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /create-on-behalf-of/confirm', () => {
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
      .get(adjudicationUrls.createOnBehalfOf.urls.check(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Check your answers')
        expect(res.text).toContain('Return to report 100')
      })
  })
})

describe('POST /create-on-behalf-of/confirm', () => {
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

    createOnBehalfOfSessionService.getRedirectUrl.mockReturnValueOnce(adjudicationUrls.checkYourAnswers.urls.start(100))
  })

  it('should redirect to the configured redirect page when the form is submitted', () => {
    return request(app)
      .post(adjudicationUrls.createOnBehalfOf.urls.check(100))
      .expect('Location', adjudicationUrls.checkYourAnswers.urls.start(100))
      .expect(() => {
        expect(placeOnReportService.setCreatedOnBehalfOf).toHaveBeenCalledTimes(1)
      })
  })
})
