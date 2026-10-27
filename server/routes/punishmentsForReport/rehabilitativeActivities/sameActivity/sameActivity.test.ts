import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import config from '../../../../config'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/rehabBatchSessionService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const rehabBatchSessionService = new RehabBatchSessionService(null) as jest.Mocked<RehabBatchSessionService>

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, rehabBatchSessionService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  rehabBatchSessionService.get.mockReturnValue({
    id: 'batch-1',
    redisIds: ['a', 'b'],
    completedRedisIds: [],
    drafts: {},
  })
  rehabBatchSessionService.nextUrl.mockReturnValue('/next')
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('Do they all have the same rehabilitative activity?', () => {
  it('asks the question for two or more punishments', () => {
    return request(app)
      .get(adjudicationUrls.sameRehabilitativeActivity.urls.start('100'))
      .expect(200)
      .expect(res => expect(res.text).toContain('Do they all have the same rehabilitative activity?'))
  })

  it('skips the question for a single punishment', () => {
    rehabBatchSessionService.get.mockReturnValue({ id: 'batch-1', redisIds: ['a'], completedRedisIds: [], drafts: {} })
    return request(app)
      .get(adjudicationUrls.sameRehabilitativeActivity.urls.start('100'))
      .expect(302)
      .expect('Location', '/next')
  })

  it('records the answer and moves on', () => {
    return request(app)
      .post(adjudicationUrls.sameRehabilitativeActivity.urls.start('100'))
      .send({ sameForAll: 'YES' })
      .expect(302)
      .expect('Location', '/next')
      .then(() => expect(rehabBatchSessionService.setSameForAll).toHaveBeenCalledWith(expect.anything(), '100', true))
  })

  it('asks for an answer', () => {
    return request(app)
      .post(adjudicationUrls.sameRehabilitativeActivity.urls.start('100'))
      .send({})
      .expect(200)
      .expect(res => expect(res.text).toContain('Select yes if they all have the same rehabilitative activity'))
  })
})
