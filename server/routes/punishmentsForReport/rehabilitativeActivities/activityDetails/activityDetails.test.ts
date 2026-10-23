import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentData, PunishmentType } from '../../../../data/PunishmentResult'
import config from '../../../../config'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

const library: PunishmentData = {
  redisId: 'library',
  type: PunishmentType.PRIVILEGE,
  privilegeType: PrivilegeType.OTHER,
  otherPrivilege: 'Library',
  duration: 21,
  suspendedUntil: '2026-12-16',
  rehabilitativeActivities: [],
}

const activity = { details: 'Victim awareness', monitorName: 'Sam Smith', endDate: '1/12/2026', totalSessions: '4' }

const firstOfTwo = `${adjudicationUrls.rehabilitativeActivityDetails.urls.start('100', 'library')}?numberOfActivities=2&currentActivityNumber=1`

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockReturnValue(library)
  punishmentsService.getPrisonerDetails.mockResolvedValue({ friendlyName: 'John Smith' } as never)
  punishmentsService.getRehabBatch.mockReturnValue({ id: 'batch-1', redisIds: ['library'], completedRedisIds: [] })
  punishmentsService.isCurrentRehabBatchForm.mockReturnValue(true)
  punishmentsService.nextRehabBatchUrl.mockReturnValue('/next')
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('Rehabilitative activity details', () => {
  it('says which batch the form is for', () =>
    request(app)
      .get(firstOfTwo)
      .expect(200)
      .expect(res => expect(res.text).toContain('name="rehabBatchId" value="batch-1"')))

  it('saves the activity and asks for the next one', () =>
    request(app)
      .post(firstOfTwo)
      .send({ rehabBatchId: 'batch-1', ...activity })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.rehabilitativeActivityDetails.urls.start('100', 'library')}?numberOfActivities=2&currentActivityNumber=2`,
      )
      .then(() =>
        expect(punishmentsService.addRehabilitativeActivity).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'library',
          1,
          { details: 'Victim awareness', monitor: 'Sam Smith', endDate: '2026-12-01', totalSessions: 4, sessionId: 1 },
        ),
      ))

  it('changes nothing from a form for another batch', () => {
    punishmentsService.isCurrentRehabBatchForm.mockReturnValue(false)
    return request(app)
      .post(firstOfTwo)
      .send({ rehabBatchId: 'old-batch', ...activity })
      .expect(302)
      .expect('Location', '/next')
      .then(() => {
        expect(punishmentsService.isCurrentRehabBatchForm).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'library',
          'old-batch',
        )
        expect(punishmentsService.addRehabilitativeActivity).not.toHaveBeenCalled()
        expect(punishmentsService.completeRehabBatchItem).not.toHaveBeenCalled()
      })
  })
})
