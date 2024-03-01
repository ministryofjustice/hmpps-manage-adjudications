import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import UserService from '../../services/userService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/userService.ts')
jest.mock('../../services/reportedAdjudicationsService.ts')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, reportedAdjudicationsService })
  userService.getUserRoles.mockResolvedValue([])
  reportedAdjudicationsService.getAgencyReportCounts.mockResolvedValue({
    transferReviewTotal: 1,
    reviewTotal: 1,
    transferOutTotal: 1,
    transferAllTotal: 2,
    hearingsToScheduleTotal: 0,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /place-a-prisoner-on-report', () => {
  it('should get the home page', () => {
    return request(app)
      .get(adjudicationUrls.homepage.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudications')
      })
  })
  it('the review tile should not be visible without the correct role', () => {
    userService.getUserRoles.mockResolvedValue(['NOT_THE_ADJUDICATIONS_REVIEWER_ROLE'])
    return request(app)
      .get(adjudicationUrls.homepage.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).not.toContain('Reports from Moorland (HMP & YOI)')
      })
  })
  it('the review tile should be visible with the correct role', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    return request(app)
      .get(adjudicationUrls.homepage.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Reports from Moorland (HMP & YOI)')
      })
  })
})
