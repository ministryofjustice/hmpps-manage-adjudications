import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import OutcomesService from '../../../../services/outcomesService'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/outcomesService')

const userService = new UserService(null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService(null) as jest.Mocked<OutcomesService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { outcomesService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /reason-for-police-referral', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { outcomesService, userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForReferral.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /reason-for-police-referral', () => {
  it('should load the `Reason for referral` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForReferral.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for the referral?')
      })
  })
})

describe('POST /reason-for-police-referral', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(adjudicationUrls.reasonForReferral.urls.start('100'))
      .send({
        referralReason: '123',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
      .then(() => expect(outcomesService.createPoliceReferral).toHaveBeenCalledWith(100, '123', expect.anything()))
  })
})
