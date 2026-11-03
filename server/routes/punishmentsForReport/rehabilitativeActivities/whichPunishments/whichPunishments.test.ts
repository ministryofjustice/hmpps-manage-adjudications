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
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, rehabBatchSessionService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getAllSessionPunishments.mockReturnValue(sessionPunishments)
  punishmentsService.getPunishmentAvailability.mockResolvedValue({
    isIndependentAdjudicatorHearing: false,
    isAdult: true,
  })
  rehabBatchSessionService.nextUrl.mockReturnValue('/next')
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('Which punishments have a rehabilitative activity condition?', () => {
  it('lists suspended punishments without a condition, and those with one as already added', () => {
    return request(app)
      .get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Which punishments have a rehabilitative activity condition?')
        expect(res.text).toContain('Loss of TV')
        expect(res.text).toContain('Suspended until 31 October 2026')
        expect(res.text).not.toContain('Loss of canteen')
        expect(res.text).not.toContain('Additional days')
        expect(res.text).not.toMatch(/value="tv" checked/)
        // library already has a condition, so it is listed but cannot be ticked
        expect(res.text).not.toContain('value="library"')
        expect(res.text).toContain('Already added:')
        expect(res.text).toMatch(/data-qa="already-added">\s*<li>Loss of library<\/li>/)
      })
  })

  it('shows no already added list when no punishment has a condition yet', () => {
    punishmentsService.getAllSessionPunishments.mockReturnValue([punishment('tv', { suspendedUntil: '2026-10-31' })])
    return request(app)
      .get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .expect(200)
      .expect(res => expect(res.text).not.toContain('Already added:'))
  })

  it('goes back to the award punishments page when every suspended punishment already has a condition', () => {
    punishmentsService.getAllSessionPunishments.mockReturnValue([
      punishment('library', { suspendedUntil: '2026-09-16', rehabilitativeActivities: [{ sessionId: 1 }] }),
    ])
    return request(app)
      .get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
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
        // library already had a condition: it keeps it and is not asked about again
        expect(rehabBatchSessionService.start).toHaveBeenCalledWith(expect.anything(), '100', ['tv'])
        expect(punishmentsService.noRehabilitativeActivities).not.toHaveBeenCalled()
      })
  })

  it('shows what was ticked when coming back part way through a batch', () => {
    rehabBatchSessionService.get.mockReturnValue({
      id: 'batch-1',
      redisIds: ['tv'],
      completedRedisIds: [],
      drafts: {},
    })
    return request(app)
      .get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toMatch(/value="tv" checked/)
        expect(res.text).not.toContain('value="library"')
      })
  })

  it('keeps a punishment in the batch on the list after its activities are saved, so it can be unticked', () => {
    rehabBatchSessionService.get.mockReturnValue({
      id: 'batch-1',
      redisIds: ['tv', 'library'],
      completedRedisIds: ['library'],
      drafts: {},
    })
    rehabBatchSessionService.includes.mockImplementation((_req, _chargeNumber, redisId) =>
      ['tv', 'library'].includes(redisId),
    )
    return request(app)
      .get(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toMatch(/value="tv" checked/)
        expect(res.text).toMatch(/value="library" checked/)
        expect(res.text).not.toContain('Already added:')
      })
  })

  it('asks whether several punishments share an activity, keeping the table order', () => {
    punishmentsService.getAllSessionPunishments.mockReturnValue([
      ...sessionPunishments,
      punishment('gym', { privilegeType: PrivilegeType.GYM, suspendedUntil: '2026-12-01' }),
    ])
    return request(app)
      .post(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .send({ redisIds: ['gym', 'tv', 'canteen'] })
      .expect(302)
      .expect('Location', adjudicationUrls.sameRehabilitativeActivity.urls.start('100'))
      .then(() => expect(rehabBatchSessionService.start).toHaveBeenCalledWith(expect.anything(), '100', ['tv', 'gym']))
  })

  it('ignores a punishment that already has a condition if the form sends it', () => {
    return request(app)
      .post(adjudicationUrls.whichPunishmentsHaveRehabilitativeActivities.urls.start('100'))
      .send({ redisIds: ['library', 'tv'] })
      .expect(302)
      .expect('Location', '/next')
      .then(() => expect(rehabBatchSessionService.start).toHaveBeenCalledWith(expect.anything(), '100', ['tv']))
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
