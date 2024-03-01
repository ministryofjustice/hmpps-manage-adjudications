import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import TestData from '../../testutils/testData'

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
    otherData: {
      displayName: 'Moriarty, James',
      formattedDateTimeOfIncident: '15 November 2021 - 11:30',
      formattedDateTimeOfDiscovery: '15 November 2021 - 11:30',
    },
  })

  reportedAdjudicationsService.getAllCompletedAdjudications.mockResolvedValue({
    size: 20,
    number: 0,
    totalElements: 2,
    content: [adjudicationOne, adjudicationTwo],
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /all-completed-reports', () => {
  it('should render the not found page without the correct role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .get(adjudicationUrls.allCompletedReports.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
  it('should render the correct page with the correct role', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])

    return request(app)
      .get(adjudicationUrls.allCompletedReports.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudications')
      })
  })
  it('should load the correct details', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    reportedAdjudicationsService.getAgencyReportCounts.mockResolvedValue({
      reviewTotal: 100,
      transferReviewTotal: 2,
      transferOutTotal: 2,
      transferAllTotal: 4,
      hearingsToScheduleTotal: 0,
    })
    return request(app)
      .get(adjudicationUrls.allCompletedReports.root)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Smith, John - G6123VU')
        expect(response.text).toContain('15 November 2021 - 11:45')
        expect(response.text).toContain('Awaiting review')
        expect(response.text).toContain('Moriarty, James - G6174VU')
        expect(response.text).toContain('15 November 2021 - 11:30')
        expect(response.text).toContain('Awaiting review')
      })
  })
})

describe('POST /all-completed-reports', () => {
  it('should redirect with the correct filter parameters', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    return request(app)
      .post(adjudicationUrls.allCompletedReports.root)
      .send({
        fromDate: { date: '01/01/2021' },
        toDate: { date: '02/01/2021' },
        status: 'AWAITING_REVIEW',
      })
      .expect(
        'Location',
        `${adjudicationUrls.allCompletedReports.root}?fromDate=01%2F01%2F2021&toDate=02%2F01%2F2021&status=AWAITING_REVIEW`
      )
  })
  it('should render the not found page without the correct role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .post(adjudicationUrls.allCompletedReports.root)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})
