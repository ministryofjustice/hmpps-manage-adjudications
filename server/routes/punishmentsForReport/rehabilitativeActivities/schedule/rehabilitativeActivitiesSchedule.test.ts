import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import type { PunishmentData } from '../../../../data/PunishmentResult'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import config from '../../../../config'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/rehabBatchSessionService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const rehabBatchSessionService = new RehabBatchSessionService(null) as jest.Mocked<RehabBatchSessionService>
const { extendRehabActivities } = jest.requireActual('../../../../services/punishmentsService').default.prototype

const library: PunishmentData = {
  redisId: 'library',
  type: PunishmentType.PRIVILEGE,
  privilegeType: PrivilegeType.OTHER,
  otherPrivilege: 'Library',
  duration: 21,
  suspendedUntil: '2026-09-16',
  rehabilitativeActivities: [
    { sessionId: 1, details: 'Cleaning cells', monitor: 'Thomas', endDate: '2026-09-16', totalSessions: 1 },
    { sessionId: 2, details: 'Course', monitor: 'Ann', endDate: '2026-09-10' },
  ],
}
const tv: PunishmentData = {
  redisId: 'tv',
  type: PunishmentType.PRIVILEGE,
  privilegeType: PrivilegeType.TV,
  duration: 21,
  suspendedUntil: '2026-10-31',
  rehabilitativeActivities: [{ sessionId: 0 }],
}

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, rehabBatchSessionService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  rehabBatchSessionService.get.mockReturnValue({
    id: 'batch-1',
    redisIds: ['library', 'tv'],
    completedRedisIds: [],
    drafts: {},
  })
  punishmentsService.getSessionPunishment.mockImplementation((req, chargeNumber, redisId) => ({ library, tv })[redisId])
  punishmentsService.extendRehabActivities.mockImplementation(extendRehabActivities)
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('Rehabilitative schedule', () => {
  it('shows every activity entered, numbering several on one punishment', () => {
    return request(app)
      .get(adjudicationUrls.rehabilitativeActivitiesSchedule.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Rehabilitative schedule')
        expect(res.text).toContain('Loss of library: activity 1 of 2')
        expect(res.text).toContain('Cleaning cells')
        expect(res.text).toContain('Thomas')
        expect(res.text).toContain('16 September 2026')
        expect(res.text).toContain('Loss of library: activity 2 of 2')
        expect(res.text).toContain('Loss of TV')
        expect(res.text).toContain('Not entered')
        expect(res.text).toContain(adjudicationUrls.editRehabilitativeActivity.urls.start('100', 'library', 1))
      })
  })

  it('goes back to the award punishments page when there is no batch', () => {
    rehabBatchSessionService.get.mockReturnValue(undefined)
    return request(app)
      .get(adjudicationUrls.rehabilitativeActivitiesSchedule.urls.start('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
  })

  it('confirms the activities were added', () => {
    return request(app)
      .post(adjudicationUrls.rehabilitativeActivitiesSchedule.urls.start('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() => {
        expect(punishmentsService.setSuccessMessage).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'Rehabilitative activity added',
        )
        expect(rehabBatchSessionService.clear).toHaveBeenCalledWith(expect.anything(), '100')
      })
  })
})
