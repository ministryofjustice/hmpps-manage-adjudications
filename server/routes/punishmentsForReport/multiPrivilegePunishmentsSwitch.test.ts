import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import PunishmentsService from '../../services/punishmentsService'
import PunishmentBatchSessionService from '../../services/punishmentBatchSessionService'
import RehabBatchSessionService from '../../services/rehabBatchSessionService'
import config from '../../config'

jest.mock('../../services/userService')
jest.mock('../../services/punishmentsService')
jest.mock('../../services/punishmentBatchSessionService')
jest.mock('../../services/rehabBatchSessionService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const punishmentBatchSessionService = new PunishmentBatchSessionService() as jest.Mocked<PunishmentBatchSessionService>
const rehabBatchSessionService = new RehabBatchSessionService(null) as jest.Mocked<RehabBatchSessionService>

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  // the test user's caseload is MDI
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['LEI']
  app = appWithAllRoutes(
    { production: false },
    { userService, punishmentsService, punishmentBatchSessionService, rehabBatchSessionService },
    {},
  )
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('pages that only exist in the award-several-punishments journey', () => {
  const pages = [
    adjudicationUrls.punishmentSameDuration.urls.start('100'),
    adjudicationUrls.punishmentDuration.urls.start('100'),
    adjudicationUrls.punishmentDuration.urls.edit('100', 'xyz'),
    adjudicationUrls.punishmentSchedule.urls.start('100'),
    adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'),
    adjudicationUrls.sameRehabilitativeActivity.urls.start('100'),
    adjudicationUrls.rehabilitativeActivitiesSchedule.urls.start('100'),
  ]

  it.each(pages)('will not show %s where the prison is not switched on', page =>
    request(app)
      .get(page)
      .expect(res => expect(res.text).toContain('Page not found')),
  )

  it.each(pages)('will not take answers on %s where the prison is not switched on', page =>
    request(app)
      .post(page)
      .send({ duration: '21', startMode: 'IMMEDIATE', sameForAll: 'YES', redisIds: ['a'] })
      .expect(res => expect(res.text).toContain('Page not found'))
      .then(() => {
        expect(punishmentsService.addSessionPunishment).not.toHaveBeenCalled()
        expect(punishmentsService.updateSessionPunishment).not.toHaveBeenCalled()
        expect(rehabBatchSessionService.start).not.toHaveBeenCalled()
        expect(punishmentBatchSessionService.setSameForAll).not.toHaveBeenCalled()
        expect(rehabBatchSessionService.setSameForAll).not.toHaveBeenCalled()
      }),
  )
})
