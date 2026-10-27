import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import PunishmentBatchSessionService from '../../../services/punishmentBatchSessionService'
import RehabBatchSessionService from '../../../services/rehabBatchSessionService'
import config from '../../../config'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')
jest.mock('../../../services/punishmentBatchSessionService')
jest.mock('../../../services/rehabBatchSessionService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const punishmentBatchSessionService = new PunishmentBatchSessionService() as jest.Mocked<PunishmentBatchSessionService>
const rehabBatchSessionService = new RehabBatchSessionService(null) as jest.Mocked<RehabBatchSessionService>

// The pages added for awarding several punishments at once
const pages = [
  adjudicationUrls.punishmentSameDuration.urls.start('100'),
  adjudicationUrls.punishmentDuration.urls.start('100'),
  adjudicationUrls.punishmentDuration.urls.edit('100', 'xyz'),
  adjudicationUrls.punishmentSchedule.urls.start('100'),
  adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'),
  adjudicationUrls.sameRehabilitativeActivity.urls.start('100'),
  adjudicationUrls.rehabilitativeActivitiesSchedule.urls.start('100'),
]

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes(
    { production: false },
    { userService, punishmentsService, punishmentBatchSessionService, rehabBatchSessionService },
    {},
  )
  userService.getUserRoles.mockResolvedValue([])
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('users without the reviewer role', () => {
  it.each(pages)('cannot view %s', url => {
    return request(app)
      .get(url)
      .expect(200)
      .expect(res => expect(res.text).toContain('Page not found'))
  })

  it.each(pages)('cannot submit %s', async url => {
    await request(app)
      .post(url)
      .send({ sameForAll: 'YES', duration: '7', startMode: 'IMMEDIATE', punishments: ['xyz'] })
      .expect(200)
      .expect(res => expect(res.text).toContain('Page not found'))
    expect(punishmentsService.addSessionPunishment).not.toHaveBeenCalled()
    expect(punishmentsService.updateSessionPunishment).not.toHaveBeenCalled()
    expect(punishmentBatchSessionService.setSameForAll).not.toHaveBeenCalled()
    expect(rehabBatchSessionService.start).not.toHaveBeenCalled()
    expect(rehabBatchSessionService.setSameForAll).not.toHaveBeenCalled()
  })
})
