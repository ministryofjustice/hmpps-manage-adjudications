import moment from 'moment'
import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { momentDateToApi } from '../../../utils/utils'

jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/userService.ts')

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
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /scheduled-hearings', () => {
  it('should render the not found page without the correct role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .get(adjudicationUrls.viewScheduledHearings.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
  it('should make the necessary api calls', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    const date = momentDateToApi(moment())
    return request(app)
      .get(adjudicationUrls.viewScheduledHearings.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(reportedAdjudicationsService.getAllHearings).toBeCalledTimes(1)
        expect(reportedAdjudicationsService.getAllHearings).toBeCalledWith(date, expect.anything())
        expect(res.text).toContain('Adjudications')
      })
  })
})

describe('POST /scheduled-hearings', () => {
  it('should redirect with the correct filter parameters', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    return request(app)
      .post(adjudicationUrls.viewScheduledHearings.urls.start())
      .send({ hearingDate: '14/11/2030' })
      .expect('Location', `${adjudicationUrls.viewScheduledHearings.root}?hearingDate=14%2F11%2F2030`)
  })
  it('should render the not found page without the correct role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .post(adjudicationUrls.viewScheduledHearings.root)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})
