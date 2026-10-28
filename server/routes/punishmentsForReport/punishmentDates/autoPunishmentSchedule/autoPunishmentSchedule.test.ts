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
  // the real lookup, so each test only sets up the session punishments
  punishmentsService.getChangedOrLatestSessionPunishment.mockImplementation(
    jest.requireActual('../../../../services/punishmentsService').default.prototype.getChangedOrLatestSessionPunishment,
  )
  punishmentsService.getAllSessionPunishments.mockReturnValue([
    { rehabilitativeActivities: [], type: PunishmentType.DAMAGES_OWED, duration: 0, damagesOwedAmount: 50 },
    {
      rehabilitativeActivities: [],
      type: PunishmentType.PRIVILEGE,
      privilegeType: PrivilegeType.OTHER,
      otherPrivilege: 'nintendo switch',
      duration: 10,
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
        expect(res.text).not.toContain('Prisoner has children under 18:')
      })
  })

  it('shows the punishment that was changed, which keeps its place in the list', () => {
    punishmentsService.getAllSessionPunishments.mockReturnValue([
      {
        rehabilitativeActivities: [],
        redisId: 'changed',
        type: PunishmentType.CONFINEMENT,
        duration: 5,
        startDate: '2023-05-01',
        endDate: '2023-05-05',
      },
      {
        rehabilitativeActivities: [],
        redisId: 'other',
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.OTHER,
        otherPrivilege: 'nintendo switch',
        duration: 10,
        startDate: '2023-04-10',
        endDate: '2023-04-19',
      },
    ])
    return request(app)
      .get(`${adjudicationUrls.punishmentAutomaticDateSchedule.urls.start('100')}?redisId=changed`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('1 May 2023')
        expect(res.text).toContain('5 May 2023')
        expect(res.text).not.toContain('10 Apr 2023')
        expect(res.text).toContain(adjudicationUrls.punishmentNumberOfDays.urls.edit('100', 'changed'))
        expect(res.text).not.toContain(adjudicationUrls.punishmentNumberOfDays.urls.edit('100', 'other'))
      })
  })

  it('displays the calculated last day and child answer for a social visits punishment', () => {
    punishmentsService.getAllSessionPunishments.mockReturnValue([
      {
        rehabilitativeActivities: [],
        type: PunishmentType.LOSS_OF_SOCIAL_VISITS,
        duration: 27,
        startDate: '2023-12-13',
        endDate: '2024-01-08',
        hasChildUnder18: false,
      },
    ])

    return request(app)
      .get(adjudicationUrls.punishmentAutomaticDateSchedule.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Loss of social visits')
        expect(res.text).toContain('Prisoner has children under 18:')
        expect(res.text).toContain('No')
        expect(res.text).toContain('Last day')
        expect(res.text).toContain('8 Jan 2024')
      })
  })
})
