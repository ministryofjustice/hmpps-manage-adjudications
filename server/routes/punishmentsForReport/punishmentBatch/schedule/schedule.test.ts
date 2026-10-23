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

const sessionPunishments: { [redisId: string]: PunishmentData } = {
  a: {
    redisId: 'a',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.CANTEEN,
    duration: 21,
    startDate: '2026-08-17',
    endDate: '2026-09-06',
    rehabilitativeActivities: [],
  },
  b: {
    redisId: 'b',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.OTHER,
    otherPrivilege: 'Library',
    duration: 21,
    suspendedUntil: '2026-09-16',
    rehabilitativeActivities: [],
  },
}

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPunishmentBatch.mockReturnValue({
    items: [
      { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN, redisId: 'a' },
      { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.OTHER, otherPrivilege: 'Library', redisId: 'b' },
    ],
  })
  punishmentsService.getSessionPunishment.mockImplementation(
    (req, chargeNumber, redisId) => sessionPunishments[redisId],
  )
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('Punishment schedule', () => {
  it('shows each punishment in the batch, with suspended ones showing the date suspended until', () => {
    return request(app)
      .get(adjudicationUrls.punishmentSchedule.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Punishment schedule')
        expect(res.text).toContain('Loss of canteen')
        expect(res.text).toContain('17 August 2026')
        expect(res.text).toContain('6 September 2026')
        expect(res.text).toContain('Loss of library')
        expect(res.text).toContain('Suspended until')
        expect(res.text).toContain('16 September 2026')
        expect(res.text).toContain(adjudicationUrls.punishmentDuration.urls.edit('100', 'b'))
      })
  })

  it('goes back to the award punishments page when there is no batch', () => {
    punishmentsService.getPunishmentBatch.mockReturnValue(undefined)
    return request(app)
      .get(adjudicationUrls.punishmentSchedule.urls.start('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
  })

  it('confirms how many punishments were added', () => {
    return request(app)
      .post(adjudicationUrls.punishmentSchedule.urls.start('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() => {
        expect(punishmentsService.setSuccessMessage).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          '2 punishments added',
        )
        expect(punishmentsService.clearPunishmentBatch).toHaveBeenCalledWith(expect.anything(), '100')
      })
  })

  it('names the punishment when only one was added', () => {
    punishmentsService.getPunishmentBatch.mockReturnValue({
      items: [{ type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN, redisId: 'a' }],
    })
    return request(app)
      .post(adjudicationUrls.punishmentSchedule.urls.start('100'))
      .expect(302)
      .then(() =>
        expect(punishmentsService.setSuccessMessage).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'Loss of canteen added',
        ),
      )
  })
})
