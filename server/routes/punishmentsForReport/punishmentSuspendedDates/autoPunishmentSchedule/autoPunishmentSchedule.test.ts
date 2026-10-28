import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { PunishmentType } from '../../../../data/PunishmentResult'

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
    {
      rehabilitativeActivities: [],
      redisId: 'changed',
      type: PunishmentType.CONFINEMENT,
      duration: 5,
      startDate: '2023-05-01',
      endDate: '2023-05-05',
      activatedFrom: '99',
    },
    {
      rehabilitativeActivities: [],
      redisId: 'other',
      type: PunishmentType.CONFINEMENT,
      duration: 10,
      startDate: '2023-04-10',
      endDate: '2023-04-19',
      activatedFrom: '98',
    },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Activated suspended punishment schedule', () => {
  it('shows the punishment just added, which is last', () =>
    request(app)
      .get(adjudicationUrls.suspendedPunishmentAutoDates.urls.existing('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('10 Apr 2023')
        expect(res.text).not.toContain('1 May 2023')
      }))

  it('shows the punishment that was changed, which keeps its place in the list', () =>
    request(app)
      .get(`${adjudicationUrls.suspendedPunishmentAutoDates.urls.existing('100')}?redisId=changed`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('1 May 2023')
        expect(res.text).not.toContain('10 Apr 2023')
        expect(res.text).toContain(adjudicationUrls.suspendedPunishmentNumberOfDays.urls.edit('100', 'changed'))
      }))
})
