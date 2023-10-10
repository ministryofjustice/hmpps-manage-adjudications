import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/reportedAdjudicationsService.ts')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockResolvedValue({
    type: PunishmentType.PRIVILEGE,
    PrivilegeType: PrivilegeType.OTHER,
    otherPrivilege: 'nintendo switch',
    days: 10,
    suspendedUntil: '4/4/2023',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.punishmentSuspendedUntil.urls.edit(
          '100',
          'xyz'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&days=6`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.punishmentSuspendedUntil.urls.edit(
          '100',
          'xyz'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&days=6`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the date the punishment is suspended until')
      })
  })
})

describe('POST ', () => {
  it('redirects to the award punishment page and saves to session', () => {
    return request(app)
      .post(
        `${adjudicationUrls.punishmentSuspendedUntil.urls.edit(
          '100',
          'xyz'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&days=6`
      )
      .send({
        suspendedUntil: '13/12/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PRIVILEGE,
            privilegeType: PrivilegeType.OTHER,
            otherPrivilege: 'nintendo switch',
            days: 6,
            suspendedUntil: '2023-12-13',
            stoppagePercentage: null,
          },
          '100',
          'xyz'
        )
      )
  })
})
