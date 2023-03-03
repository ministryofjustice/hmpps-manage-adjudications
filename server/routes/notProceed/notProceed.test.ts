import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import OutcomesService from '../../services/outcomesService'
import { NotProceedReason } from '../../data/HearingAndOutcomeResult'

jest.mock('../../services/userService')
jest.mock('../../services/outcomesService')

const userService = new UserService(null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService(null) as jest.Mocked<OutcomesService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, outcomesService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /not-proceed', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, outcomesService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /not-proceed', () => {
  it('should load the `Not proceed` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForNotProceeding.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for not proceeding?')
      })
  })
})

describe('POST /not-proceed', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.reasonForNotProceeding.urls.start(100)}`)
      .send({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: 'details',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
      .then(() =>
        expect(outcomesService.createNotProceed).toHaveBeenCalledWith(
          100,
          NotProceedReason.NOT_FAIR,
          'details',
          expect.anything()
        )
      )
  })
})
