import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import config from '../../../config'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  config.v2EndpointsFlag = 'true'
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET damages owed', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.damagesAmount.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET damages owed', () => {
  it('should load the `Damages owed page` page', () => {
    return request(app)
      .get(adjudicationUrls.damagesAmount.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the amount to be recovered for damages')
      })
  })
})

describe('POST damages owed', () => {
  it('should submit', () => {
    return request(app)
      .post(adjudicationUrls.damagesAmount.urls.start('100'))
      .send({
        damagesOwedAmount: '100',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
  })
})
