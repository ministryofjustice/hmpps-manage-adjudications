import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import RehabBatchSessionService from '../../../../services/rehabBatchSessionService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import config from '../../../../config'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/rehabBatchSessionService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const rehabBatchSessionService = new RehabBatchSessionService(null) as jest.Mocked<RehabBatchSessionService>

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons
const editUrl = adjudicationUrls.editRehabilitativeActivity.urls.start('100', 'library', 1)
const answers = { details: 'Course', monitorName: 'Thomas Brown', endDate: '20/09/2026', totalSessions: '2' }

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, rehabBatchSessionService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPrisonerDetails.mockResolvedValue({ friendlyName: 'John Smith' } as never)
  punishmentsService.getSessionPunishment.mockReturnValue({
    redisId: 'library',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.OTHER,
    otherPrivilege: 'Library',
    duration: 21,
    suspendedUntil: '2026-09-16',
    rehabilitativeActivities: [{ sessionId: 1, details: 'Course' }],
  })
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('changing a rehabilitative activity', () => {
  it('rejects a completion date after the date the punishment is suspended until', () => {
    return request(app)
      .post(editUrl)
      .send(answers)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(
          'Completion date must be on or before 16 September 2026, the date the punishment is suspended until',
        )
        expect(punishmentsService.editRehabilitativeActivity).not.toHaveBeenCalled()
      })
  })

  it('saves a completion date on or before that date', () => {
    return request(app)
      .post(editUrl)
      .send({ ...answers, endDate: '16/09/2026' })
      .expect(302)
      .then(() => expect(punishmentsService.editRehabilitativeActivity).toHaveBeenCalled())
  })

  it('does not apply the rule for a prison that is not switched on', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = []
    return request(app)
      .post(editUrl)
      .send(answers)
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
  })
})
