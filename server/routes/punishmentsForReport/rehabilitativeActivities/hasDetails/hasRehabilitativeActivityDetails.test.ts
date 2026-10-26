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

const sessionPunishments: { [redisId: string]: PunishmentData } = {
  library: {
    redisId: 'library',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.OTHER,
    otherPrivilege: 'Library',
    duration: 21,
    suspendedUntil: '2026-09-16',
    rehabilitativeActivities: [],
  },
  tv: {
    redisId: 'tv',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.TV,
    duration: 21,
    suspendedUntil: '2026-10-31',
    rehabilitativeActivities: [],
  },
}

let app: Express
const originalPrisons = config.featureToggles.multiPrivilegePunishmentsPrisons

beforeEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = ['ALL']
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, rehabBatchSessionService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockImplementation(
    (req, chargeNumber, redisId) => sessionPunishments[redisId],
  )
  rehabBatchSessionService.get.mockReturnValue({
    id: 'batch-1',
    redisIds: ['library', 'tv'],
    completedRedisIds: [],
  })
  rehabBatchSessionService.isCurrentForm.mockReturnValue(true)
  rehabBatchSessionService.nextUrl.mockReturnValue('/next')
})

afterEach(() => {
  config.featureToggles.multiPrivilegePunishmentsPrisons = originalPrisons
  jest.resetAllMocks()
})

describe('Do you have the details of the rehabilitative activities?', () => {
  it('names the punishment and asks for the number of activities under Yes', () => {
    return request(app)
      .get(adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Do you have the details of the rehabilitative activities for loss of library?')
        expect(res.text).toContain('Enter the number of rehabilitative activities')
        expect(res.text).toContain('name="rehabBatchId" value="batch-1"')
      })
  })

  it('lists the punishments when one answer covers them all', () => {
    rehabBatchSessionService.get.mockReturnValue({
      redisIds: ['library', 'tv'],
      completedRedisIds: [],
      sameForAll: true,
    })
    return request(app)
      .get(adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Do you have the details of the rehabilitative activities?')
        expect(res.text).toContain('These answers will be applied to:')
        expect(res.text).toContain('<li>Loss of library</li>')
        expect(res.text).toContain('<li>Loss of TV</li>')
      })
  })

  it('goes on to the first activity when the details are known, keeping the activities it has for now', () => {
    return request(app)
      .post(adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library'))
      .send({ hasRehabilitativeActivitiesDetails: 'YES', numberOfActivities: '2' })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.rehabilitativeActivityDetails.urls.start('100', 'library')}?numberOfActivities=2&currentActivityNumber=1`,
      )
      .then(() => {
        expect(rehabBatchSessionService.startDraft).toHaveBeenCalledWith(expect.anything(), '100', 'library')
        expect(punishmentsService.removeAnyRehabilitativeActivities).not.toHaveBeenCalled()
      })
  })

  it('passes the number of activities on as a plain number', () =>
    request(app)
      .post(adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library'))
      .send({ hasRehabilitativeActivitiesDetails: 'YES', numberOfActivities: '02' })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.rehabilitativeActivityDetails.urls.start('100', 'library')}?numberOfActivities=2&currentActivityNumber=1`,
      ))

  it('records one activity to be entered later when the details are not known', () => {
    return request(app)
      .post(adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library'))
      .send({ hasRehabilitativeActivitiesDetails: 'NO' })
      .expect(302)
      .expect('Location', '/next')
      .then(() => {
        expect(punishmentsService.addEmptyRehabilitativeActivities).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'library',
          1,
        )
        expect(rehabBatchSessionService.completeItem).toHaveBeenCalledWith(expect.anything(), '100', 'library')
      })
  })

  it.each([
    [{}, 'Select yes if you have the details of the rehabilitative activities'],
    [{ hasRehabilitativeActivitiesDetails: 'YES' }, 'Enter the number of rehabilitative activities'],
    [
      { hasRehabilitativeActivitiesDetails: 'YES', numberOfActivities: 'two' },
      'Number of rehabilitative activities must be a whole number, like 1',
    ],
    [
      { hasRehabilitativeActivitiesDetails: 'YES', numberOfActivities: '0' },
      'Number of rehabilitative activities must be a whole number, like 1',
    ],
    [
      { hasRehabilitativeActivitiesDetails: 'YES', numberOfActivities: '11' },
      'Number of rehabilitative activities must be 10 or fewer',
    ],
  ])('rejects %o', (body, message) => {
    return request(app)
      .post(adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library'))
      .send(body)
      .expect(200)
      .expect(res => expect(res.text).toContain(message))
  })

  it.each([
    ['YES', { hasRehabilitativeActivitiesDetails: 'YES', numberOfActivities: '2' }],
    ['NO', { hasRehabilitativeActivitiesDetails: 'NO' }],
  ])('changes nothing when answered %s on a form from another batch', (_, body) => {
    rehabBatchSessionService.isCurrentForm.mockReturnValue(false)
    return request(app)
      .post(adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library'))
      .send({ rehabBatchId: 'old-batch', ...body })
      .expect(302)
      .expect('Location', '/next')
      .then(() => {
        expect(rehabBatchSessionService.isCurrentForm).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'library',
          'old-batch',
        )
        expect(rehabBatchSessionService.startDraft).not.toHaveBeenCalled()
        expect(punishmentsService.addEmptyRehabilitativeActivities).not.toHaveBeenCalled()
        expect(rehabBatchSessionService.completeItem).not.toHaveBeenCalled()
      })
  })

  it('keeps the old page when the prison is not switched on', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = []
    return request(app)
      .post(
        `${adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library')}?numberOfActivities=3`,
      )
      .send({ hasRehabilitativeActivitiesDetails: 'NO' })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.addEmptyRehabilitativeActivities).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'library',
          3,
        ),
      )
  })
})
