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

const activityPage = (current: number) =>
  `${adjudicationUrls.rehabilitativeActivityDetails.urls.start('100', 'library')}?numberOfActivities=2&currentActivityNumber=${current}`
const firstOfTwo = activityPage(1)
const enteredFirst = { details: 'Gym', monitor: 'Jo', endDate: '2026-11-20', sessionId: 1 }

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
  punishmentsService.getRehabDraft.mockReturnValue([])
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

  it('starts from the details the punishment already has', () => {
    punishmentsService.getSessionPunishment.mockReturnValue({
      ...library,
      hasRehabilitativeActivitiesDetails: true,
      rehabilitativeActivities: [{ sessionId: 1, details: 'Course', monitor: 'Thomas', endDate: '2026-11-01' }],
    })
    return request(app)
      .get(firstOfTwo)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Course')
        expect(res.text).toContain('Thomas')
        expect(res.text).toContain('1/11/2026')
      })
  })

  it('shows what was entered for the activity in preference', () => {
    punishmentsService.getSessionPunishment.mockReturnValue({
      ...library,
      hasRehabilitativeActivitiesDetails: true,
      rehabilitativeActivities: [{ sessionId: 1, details: 'Course', monitor: 'Thomas', endDate: '2026-11-01' }],
    })
    punishmentsService.getRehabDraft.mockReturnValue([enteredFirst])
    return request(app)
      .get(firstOfTwo)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Gym')
        expect(res.text).not.toContain('Course')
      })
  })

  it('holds the activity and asks for the next one, leaving the punishment as it was', () =>
    request(app)
      .post(firstOfTwo)
      .send({ rehabBatchId: 'batch-1', ...activity })
      .expect(302)
      .expect('Location', activityPage(2))
      .then(() => {
        expect(punishmentsService.saveRehabDraftActivity).toHaveBeenCalledWith(expect.anything(), '100', 'library', 1, {
          details: 'Victim awareness',
          monitor: 'Sam Smith',
          endDate: '2026-12-01',
          totalSessions: 4,
          sessionId: 1,
        })
        expect(punishmentsService.addRehabilitativeActivity).not.toHaveBeenCalled()
        expect(punishmentsService.applyRehabDraft).not.toHaveBeenCalled()
      }))

  it('gives the punishment its new activities once the last one is entered', () => {
    punishmentsService.getRehabDraft.mockReturnValue([enteredFirst])
    return request(app)
      .post(activityPage(2))
      .send({ rehabBatchId: 'batch-1', ...activity })
      .expect(302)
      .expect('Location', '/next')
      .then(() => {
        expect(punishmentsService.saveRehabDraftActivity).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'library',
          2,
          expect.objectContaining({ details: 'Victim awareness' }),
        )
        expect(punishmentsService.applyRehabDraft).toHaveBeenCalledWith(expect.anything(), '100', 'library')
        expect(punishmentsService.completeRehabBatchItem).toHaveBeenCalledWith(expect.anything(), '100', 'library')
      })
  })

  it.each([
    ['the details question has not been answered', undefined, '2'],
    ['an earlier activity has not been entered', [], '2'],
    ['the activity number is far beyond those entered', [enteredFirst], '1000000000'],
    ['the activity number is not a whole number', [enteredFirst], '1.5'],
    ['the activity number is missing', [enteredFirst], ''],
  ])('changes nothing when %s', (_, draft, current) => {
    punishmentsService.getRehabDraft.mockReturnValue(draft)
    return request(app)
      .post(
        `${adjudicationUrls.rehabilitativeActivityDetails.urls.start('100', 'library')}?numberOfActivities=2&currentActivityNumber=${current}`,
      )
      .send({ rehabBatchId: 'batch-1', ...activity })
      .expect(302)
      .expect('Location', '/next')
      .then(() => {
        expect(punishmentsService.saveRehabDraftActivity).not.toHaveBeenCalled()
        expect(punishmentsService.applyRehabDraft).not.toHaveBeenCalled()
      })
  })

  it('keeps the old page when the prison is not switched on', () => {
    config.featureToggles.multiPrivilegePunishmentsPrisons = []
    return request(app)
      .post(firstOfTwo)
      .send(activity)
      .expect(302)
      .expect('Location', activityPage(2))
      .then(() => {
        expect(punishmentsService.addRehabilitativeActivity).toHaveBeenCalledWith(
          expect.anything(),
          '100',
          'library',
          1,
          expect.objectContaining({ details: 'Victim awareness' }),
        )
        expect(punishmentsService.saveRehabDraftActivity).not.toHaveBeenCalled()
      })
  })

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
        expect(punishmentsService.saveRehabDraftActivity).not.toHaveBeenCalled()
        expect(punishmentsService.completeRehabBatchItem).not.toHaveBeenCalled()
      })
  })
})
