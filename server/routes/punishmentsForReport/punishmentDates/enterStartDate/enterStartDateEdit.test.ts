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
  null,
  null,
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockResolvedValue({
    type: PunishmentType.PRIVILEGE,
    PrivilegeType: PrivilegeType.OTHER,
    otherPrivilege: 'nintendo switch',
    duration: 10,
    startDate: '4/4/2023',
    endDate: '14/4/2023',
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
        `${adjudicationUrls.punishmentStartDate.urls.edit(
          '100',
          'xyz',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=6`,
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
        `${adjudicationUrls.punishmentStartDate.urls.edit(
          '100',
          'xyz',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=6`,
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the date the punishment will start')
      })
  })
})

describe('POST ', () => {
  it('redirects to the punishment schedule page and saves to session', () => {
    return request(app)
      .post(
        `${adjudicationUrls.punishmentStartDate.urls.edit(
          '100',
          'xyz',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=6`,
      )
      .send({
        startDate: '13/12/2023',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentAutomaticDateSchedule.urls.start(
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=6&startDate=13%2F12%2F2023`,
      )
      .then(() =>
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PRIVILEGE,
            privilegeType: PrivilegeType.OTHER,
            otherPrivilege: 'nintendo switch',
            duration: 6,
            startDate: '2023-12-13',
            endDate: '2023-12-18',
            stoppagePercentage: null,
            rehabilitativeActivities: [],
          },
          '100',
          'xyz',
        ),
      )
  })
})
