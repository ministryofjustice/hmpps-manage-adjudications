import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import TestData from '../../testutils/testData'
import UserService from '../../../services/userService'

jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/userService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null,
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  const reportedAdjudication = testData.reportedAdjudication({
    chargeNumber: '12345',
    prisonerNumber: 'G7234VB',
    otherData: {
      displayName: 'Smith, James',
    },
  })
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({ reportedAdjudication })
  reportedAdjudicationsService.getAdjudicationDISFormData.mockResolvedValue([reportedAdjudication])
  reportedAdjudicationsService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G7234VB',
      firstName: 'JAMES',
      lastName: 'SMITH',
    }),
  )

  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, userService }, {})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /print-issue-forms', () => {
  it('should load print and issue forms page', () => {
    return request(app)
      .get(adjudicationUrls.forms.urls.view('12345'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Notice of being placed on report')
        expect(reportedAdjudicationsService.getAdjudicationDISFormData).toBeCalledTimes(1)
        expect(reportedAdjudicationsService.filterAdjudicationsByLocation).toBeCalledTimes(0)
      })
  })

  it('should not load print and issue forms page if user does not have ALO role', () => {
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])

    return request(app)
      .get(adjudicationUrls.forms.urls.view('12345'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Page not found')
      })
  })
})
