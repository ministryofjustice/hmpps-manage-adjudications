import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentData, PunishmentType } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

const punishment = (redisId: string, overrides: Partial<PunishmentData>): PunishmentData => ({
  redisId,
  type: PunishmentType.PRIVILEGE,
  privilegeType: PrivilegeType.TV,
  duration: 10,
  rehabilitativeActivities: [],
  ...overrides,
})

const sessionPunishments = [
  punishment('tv', { suspendedUntil: '2026-10-31' }),
  punishment('canteen', { privilegeType: PrivilegeType.CANTEEN, startDate: '2026-08-17', endDate: '2026-08-26' }),
  punishment('library', {
    privilegeType: PrivilegeType.OTHER,
    otherPrivilege: 'Library',
    suspendedUntil: '2026-09-16',
    rehabilitativeActivities: [{ sessionId: 0 }],
  }),
  punishment('days', { type: PunishmentType.ADDITIONAL_DAYS, privilegeType: undefined, suspendedUntil: '2026-09-16' }),
]

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getAllSessionPunishments.mockReturnValue(sessionPunishments)
  punishmentsService.getPunishmentAvailability.mockResolvedValue({
    isIndependentAdjudicatorHearing: false,
    isAdult: true,
  })
  punishmentsService.nextRehabBatchUrl.mockReturnValue('/next')
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Which punishments have a rehabilitative activity condition?', () => {
  it('lists only suspended punishments that can have a condition, ticking ones that already have one', () => {
    return request(app)
      .get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Which punishments have a rehabilitative activity condition?')
        expect(res.text).toContain('Loss of TV')
        expect(res.text).toContain('Suspended until 31 October 2026')
        expect(res.text).toContain('Loss of library')
        expect(res.text).not.toContain('Loss of canteen')
        expect(res.text).not.toContain('Additional days')
        expect(res.text).toMatch(/value="library" checked/)
        expect(res.text).not.toMatch(/value="tv" checked/)
      })
  })

  it('goes back to the award punishments page after an independent adjudicator hearing', () => {
    punishmentsService.getPunishmentAvailability.mockResolvedValue({
      isIndependentAdjudicatorHearing: true,
      isAdult: true,
    })
    return request(app)
      .get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
  })

  it('starts a batch for one punishment and moves on', () => {
    return request(app)
      .post(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .send({ redisIds: 'tv' })
      .expect(302)
      .expect('Location', '/next')
      .then(() => {
        expect(punishmentsService.startRehabBatch).toHaveBeenCalledWith(expect.anything(), '100', ['tv'])
        // library had a condition and was unticked
        expect(punishmentsService.noRehabilitativeActivities).toHaveBeenCalledWith(expect.anything(), '100', 'library')
      })
  })

  it('asks whether several punishments share an activity, keeping the table order', () => {
    return request(app)
      .post(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .send({ redisIds: ['library', 'tv', 'canteen'] })
      .expect(302)
      .expect('Location', adjudicationUrls.sameRehabilitativeActivity.urls.start('100'))
      .then(() =>
        expect(punishmentsService.startRehabBatch).toHaveBeenCalledWith(expect.anything(), '100', ['tv', 'library']),
      )
  })

  it('asks for at least one punishment', () => {
    return request(app)
      .post(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .send({})
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Select which punishments have a rehabilitative activity condition')
        expect(res.text).toContain('href="#redisIds"')
      })
  })
})
