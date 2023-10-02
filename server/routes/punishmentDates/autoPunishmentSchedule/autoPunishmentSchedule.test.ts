import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import config from '../../../config'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')
jest.mock('../../../services/reportedAdjudicationsService.ts')

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
  punishmentsService.getAllSessionPunishments.mockResolvedValue([
    {
      type: PunishmentType.DAMAGES_OWED,
      days: 0,
      amount: 50,
    },
    {
      type: PunishmentType.PRIVILEGE,
      PrivilegeType: PrivilegeType.OTHER,
      otherPrivilege: 'nintendo switch',
      days: 10,
      startDate: '2023-04-10',
      endDate: '2023-04-19',
    },
  ])
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
      .get(adjudicationUrls.punishmentAutomaticDateSchedule.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.punishmentAutomaticDateSchedule.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Punishment schedule')
        expect(res.text).toContain('10 Apr 2023')
        expect(res.text).toContain('10')
        expect(res.text).toContain('19 Apr 2023')
      })
  })
})
