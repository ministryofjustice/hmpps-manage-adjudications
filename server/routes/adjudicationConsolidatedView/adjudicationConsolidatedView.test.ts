import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import PunishmentsService from '../../services/punishmentsService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/decisionTreeService.ts')
jest.mock('../../services/punishmentsService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null,
) as jest.Mocked<ReportedAdjudicationsService>
const decisionTreeService = new DecisionTreeService(null, null, null, null, null) as jest.Mocked<DecisionTreeService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

const url = adjudicationUrls.prisonerReportConsolidated.urls.view('G7234VB', 'MDI-100001')

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { reportedAdjudicationsService, decisionTreeService, punishmentsService },
  )

  reportedAdjudicationsService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G7234VB',
      firstName: 'James',
      lastName: 'Smith',
    }),
  )
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber: 'MDI-100001',
      prisonerNumber: 'G7234VB',
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET consolidated adjudication view - caseload restrictions', () => {
  it('should not show the adjudication for a prisoner outside the users caseloads', () => {
    reportedAdjudicationsService.getPrisonerDetails.mockResolvedValue(
      testData.prisonerResultSummary({
        offenderNo: 'G7234VB',
        firstName: 'James',
        lastName: 'Smith',
        agencyId: 'BXI',
      }),
    )

    return request(app)
      .get(url)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('You do not have permission to view people outside of your establishment')
        expect(response.text).not.toContain('MDI-100001')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).not.toHaveBeenCalled()
      })
  })

  it('should not let the agency query parameter grant access to a prisoner outside the users caseloads', () => {
    reportedAdjudicationsService.getPrisonerDetails.mockResolvedValue(
      testData.prisonerResultSummary({
        offenderNo: 'G7234VB',
        firstName: 'James',
        lastName: 'Smith',
        agencyId: 'BXI',
      }),
    )

    return request(app)
      .get(`${url}?agency=BXI`)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('You do not have permission to view people outside of your establishment')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).not.toHaveBeenCalled()
      })
  })

  it('should not show an adjudication belonging to a different prisoner', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber: 'MDI-100001',
        prisonerNumber: 'A1234AA',
      }),
    })

    return request(app)
      .get(url)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('You do not have permission to view people outside of your establishment')
        expect(response.text).not.toContain('Adjudication for charge MDI-100001')
      })
  })
})
