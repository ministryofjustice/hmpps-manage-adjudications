import { Express } from 'express'
import request from 'supertest'
import { randomUUID } from 'crypto'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockResolvedValue({
    type: PunishmentType.EARNINGS,
    stoppagePercentage: 25,
  })
  punishmentsService.getPunishmentAvailability.mockResolvedValue({
    isIndependentAdjudicatorHearing: false,
    isAdult: true,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /punishment', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.edit('100', randomUUID()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /punishment', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.punishment.urls.edit('100', randomUUID()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Add a punishment or money for damages')
      })
  })
})

describe('POST /punishment', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.punishment.urls.edit('100', 'XYZ')}`)
      .send({
        punishmentType: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'nintendo switch',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentNumberOfDays.urls.edit(
          '100',
          'XYZ',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch`,
      )
  })
  it('should successfully call the endpoint and redirect - only passing parameters with new data', () => {
    return request(app)
      .post(`${adjudicationUrls.punishment.urls.edit('100', 'XYZ')}`)
      .send({
        punishmentType: PunishmentType.EXTRA_WORK,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentNumberOfDays.urls.edit('100', 'XYZ')}?punishmentType=EXTRA_WORK`,
      )
  })
  it('preserves the child answer when editing a social visits punishment', () => {
    return request(app)
      .post(adjudicationUrls.punishment.urls.edit('100', 'XYZ'))
      .send({
        punishmentType: PunishmentType.RESTRICTION_OF_SOCIAL_VISITS,
        restrictionHasChildUnder18: 'false',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentNumberOfDays.urls.edit(
          '100',
          'XYZ',
        )}?punishmentType=RESTRICTION_OF_SOCIAL_VISITS&hasChildUnder18=false`,
      )
  })
})
