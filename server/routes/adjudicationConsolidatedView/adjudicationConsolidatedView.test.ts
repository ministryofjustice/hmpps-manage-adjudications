import { Express } from 'express'
import request from 'supertest'
import { PrisonerAdjudicationsPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import PunishmentsService from '../../services/punishmentsService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'
import mockPermissions from '../testutils/mockPermissions'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/decisionTreeService.ts')
jest.mock('../../services/punishmentsService.ts')
jest.mock('@ministryofjustice/hmpps-prison-permissions-lib', () => ({
  ...jest.requireActual('@ministryofjustice/hmpps-prison-permissions-lib'),
  isGranted: jest.fn(),
  prisonerPermissionsGuard: jest.fn(),
}))

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

const url = adjudicationUrls.prisonerReportConsolidated.urls.view('G7234VB', 'MDI-100001')

const buildApp = (granted: boolean): Express => {
  mockPermissions({ [PrisonerAdjudicationsPermission.read]: granted })
  return appWithAllRoutes(
    { production: false },
    { reportedAdjudicationsService, decisionTreeService, punishmentsService },
  )
}

beforeEach(() => {
  reportedAdjudicationsService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({ offenderNo: 'G7234VB', firstName: 'James', lastName: 'Smith' }),
  )
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({ chargeNumber: 'MDI-100001', prisonerNumber: 'G7234VB' }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET consolidated adjudication view - access control', () => {
  it('should not show the adjudication when the user may not view the prisoner', () => {
    return request(buildApp(false))
      .get(url)
      .expect(403)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('You do not have permission to view people outside of your establishment')
        expect(response.text).not.toContain('Adjudication for charge MDI-100001')
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).not.toHaveBeenCalled()
      })
  })

  it('should not show an adjudication belonging to a different prisoner', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: testData.reportedAdjudication({ chargeNumber: 'MDI-100001', prisonerNumber: 'A1234AA' }),
    })

    return request(buildApp(true))
      .get(url)
      .expect(403)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('You do not have permission to view people outside of your establishment')
        expect(response.text).not.toContain('Adjudication for charge MDI-100001')
      })
  })
})
