import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import TestData from '../../testutils/testData'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import { TransferredReportType } from '../../../utils/adjudicationFilterHelper'

jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/userService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, userService })

  const adjudicationOne = testData.reportedAdjudication({
    chargeNumber: '2',
    prisonerNumber: 'G6123VU',
    dateTimeOfIncident: '2021-11-15T11:45:00',
    status: ReportedAdjudicationStatus.ADJOURNED,
    otherData: {
      displayName: 'Smith, John',
      formattedDateTimeOfIncident: '15 November 2021 - 11:45',
      formattedDateTimeOfDiscovery: '15 November 2021 - 11:45',
    },
  })
  const adjudicationTwo = testData.reportedAdjudication({
    chargeNumber: '1',
    prisonerNumber: 'G6174VU',
    dateTimeOfIncident: '2021-11-15T11:30:00',
    status: ReportedAdjudicationStatus.ADJOURNED,
    otherData: {
      displayName: 'Moriarty, James',
      formattedDateTimeOfIncident: '15 November 2021 - 11:30',
      formattedDateTimeOfDiscovery: '15 November 2021 - 11:30',
    },
  })

  reportedAdjudicationsService.getTransferredAdjudicationReports.mockResolvedValue({
    size: 20,
    number: 0,
    totalElements: 2,
    content: [adjudicationOne, adjudicationTwo],
  })

  reportedAdjudicationsService.getAgencyReportCounts.mockResolvedValue({
    reviewTotal: 100,
    transferReviewTotal: 2,
    transferOutTotal: 2,
    transferAllTotal: 4,
    hearingsToScheduleTotal: 0,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should render the not found page without the correct role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .get(adjudicationUrls.reportsTransferredOut.urls.start())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
  it('should render the correct page with the correct role', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])

    return request(app)
      .get(adjudicationUrls.reportsTransferredOut.urls.start())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Reports for people transferred in or out')
      })
  })
  it('should load the correct details', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])

    return request(app)
      .get(adjudicationUrls.reportsTransferredOut.urls.start())
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('All (4)')
        expect(response.text).toContain('To review after a transfer in (2)')
        expect(response.text).toContain('To update for a transfer out (2)')
        expect(response.text).toContain('Smith, John - G6123VU')
        expect(response.text).toContain('15 November 2021 - 11:45')
        expect(response.text).toContain('Moriarty, James - G6174VU')
        expect(response.text).toContain('15 November 2021 - 11:30')
      })
  })
})

describe('POST /all-transferred-reports', () => {
  it('should redirect with the correct filter parameters', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    return request(app)
      .post(adjudicationUrls.reportsTransferredOut.urls.start())
      .send({
        status: ReportedAdjudicationStatus.ADJOURNED,
        type: TransferredReportType.OUT,
      })
      .expect('Location', `${adjudicationUrls.reportsTransferredOut.urls.start()}?status=ADJOURNED&type=OUT`)
  })
  it('should render the not found page without the correct role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .post(adjudicationUrls.reportsTransferredOut.urls.start())
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})
