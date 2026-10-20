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
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSessionPunishment.mockImplementation(
    (req, chargeNumber, redisId) => sessionPunishments[redisId],
  )
  punishmentsService.getRehabBatch.mockReturnValue({ redisIds: ['library', 'tv'], completedRedisIds: [] })
  punishmentsService.nextRehabBatchUrl.mockReturnValue('/next')
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
      })
  })

  it('lists the punishments when one answer covers them all', () => {
    punishmentsService.getRehabBatch.mockReturnValue({
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

  it('goes on to the first activity when the details are known', () => {
    return request(app)
      .post(adjudicationUrls.doYouHaveTheRehabilitativeActivitiesDetails.urls.start('100', 'library'))
      .send({ hasRehabilitativeActivitiesDetails: 'YES', numberOfActivities: '2' })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.rehabilitativeActivityDetails.urls.start('100', 'library')}?numberOfActivities=2&currentActivityNumber=1`,
      )
      .then(() =>
        expect(punishmentsService.removeAnyRehabilitativeActivities).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'library',
        ),
      )
  })

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
        expect(punishmentsService.completeRehabBatchItem).toHaveBeenCalledWith(expect.anything(), '100', 'library')
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
