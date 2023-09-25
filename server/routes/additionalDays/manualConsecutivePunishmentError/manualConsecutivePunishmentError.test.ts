import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import TestData from '../../testutils/testData'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const testData = new TestData()
const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'John',
      lastName: 'Smith',
    })
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET charge number validation page', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.manualConsecutivePunishmentError.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET charge number validation page - correct title', () => {
  it('should load the page', () => {
    return request(app)
      .get(`${adjudicationUrls.manualConsecutivePunishmentError.urls.start('100')}?chargeNumber=1234567`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(
          'Charge number 1234567 is not linked to a punishment of added days for this prisoner'
        )
      })
  })
})
