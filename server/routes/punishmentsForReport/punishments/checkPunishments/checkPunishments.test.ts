import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

const punishmentsOnSession = [
  {
    redisId: 'asdfg-123-erty',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.FACILITIES,
    duration: 10,
    startDate: '2023-04-10',
    endDate: '2023-04-20',
  },
]

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getAllSessionPunishments.mockResolvedValue(punishmentsOnSession)
  punishmentsService.getReasonForChangePunishments.mockResolvedValue({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.checkPunishments.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the correct page', () => {
    return request(app)
      .get(adjudicationUrls.checkPunishments.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Check your answers before submitting')
      })
  })
})

describe('POST', () => {
  it('should successfully call the endpoint', () => {
    return request(app)
      .post(`${adjudicationUrls.checkPunishments.urls.start('100')}`)
      .send()
      .then(() =>
        expect(punishmentsService.createPunishmentSet).toHaveBeenCalledWith(
          punishmentsOnSession,
          '100',
          expect.anything()
        )
      )
  })
  it('should redirect after submission', () => {
    return request(app)
      .post(`${adjudicationUrls.checkPunishments.urls.start('100')}`)
      .send()
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentsAndDamages.urls.review('100'))
  })
})
