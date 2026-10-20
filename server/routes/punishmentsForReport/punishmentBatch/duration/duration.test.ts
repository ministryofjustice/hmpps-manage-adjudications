import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentBatch, PunishmentType } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

const canteen = { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.CANTEEN }
const library = { type: PunishmentType.PRIVILEGE, privilegeType: PrivilegeType.OTHER, otherPrivilege: 'library' }

let app: Express

const withBatch = (batch: PunishmentBatch) => {
  punishmentsService.getPunishmentBatch.mockReturnValue(batch)
  punishmentsService.nextUnansweredBatchItemIndex.mockReturnValue(batch.items.findIndex(item => !item.redisId))
}

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getLastHearingDate.mockResolvedValue('2026-08-17')
  punishmentsService.getPunishmentAvailability.mockResolvedValue({
    isIndependentAdjudicatorHearing: false,
    isAdult: true,
  })
  punishmentsService.nextPunishmentBatchUrl.mockReturnValue(adjudicationUrls.punishmentSchedule.urls.start('100'))
  punishmentsService.addSessionPunishment.mockResolvedValueOnce('first').mockResolvedValueOnce('second')
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET duration and start date', () => {
  it('shows the page not found page without the reviewer role', () => {
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
    return request(app)
      .get(adjudicationUrls.punishmentDuration.urls.start('100'))
      .expect(res => expect(res.text).toContain('Page not found'))
  })

  it('asks about the next punishment, captioned with its place in the batch', () => {
    withBatch({ items: [{ ...canteen, redisId: 'a' }, library] })
    return request(app)
      .get(adjudicationUrls.punishmentDuration.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Punishment 2 of 2')
        expect(res.text).toContain('Loss of library: duration and start date')
        expect(res.text).toContain('How many days will this punishment last?')
        expect(res.text).toContain('When will this punishment take effect?')
        expect(res.text).toContain('Immediately, on the last day of the hearing: 17 August 2026')
      })
  })

  it('asks once for all punishments when they share a duration', () => {
    withBatch({ items: [canteen, library], sameForAll: true })
    return request(app)
      .get(adjudicationUrls.punishmentDuration.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Duration and start date for all 2 punishments')
        expect(res.text).toContain('These answers will be applied to: Loss of canteen, Loss of library.')
        expect(res.text).toContain('How many days will the punishments last?')
        expect(res.text).not.toContain('Punishment 1 of 2')
      })
  })

  it('has no caption for a single punishment', () => {
    withBatch({ items: [{ type: PunishmentType.CONFINEMENT }] })
    return request(app)
      .get(adjudicationUrls.punishmentDuration.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Cellular confinement: duration and start date')
        expect(res.text).not.toContain('Punishment 1 of 1')
      })
  })

  it('goes on to wherever the batch is up to when nothing is left to answer', () => {
    withBatch({ items: [{ ...canteen, redisId: 'a' }] })
    return request(app)
      .get(adjudicationUrls.punishmentDuration.urls.start('100'))
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentSchedule.urls.start('100'))
  })
})

describe('POST duration and start date', () => {
  it('adds a punishment starting on the last day of the hearing', () => {
    withBatch({ items: [canteen, library] })
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.start('100'))
      .send({ duration: '21', startMode: 'IMMEDIATE' })
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentSchedule.urls.start('100'))
      .then(() => {
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PRIVILEGE,
            privilegeType: PrivilegeType.CANTEEN,
            otherPrivilege: null,
            stoppagePercentage: null,
            duration: 21,
            startDate: '2026-08-17',
            endDate: '2026-09-06',
            rehabilitativeActivities: [],
          },
          '100',
        )
        expect(punishmentsService.markBatchItemAnswered).toHaveBeenCalledWith(expect.anything(), '100', 0, 'first')
      })
  })

  it('adds a punishment starting on a later date', () => {
    withBatch({ items: [{ ...canteen, redisId: 'a' }, library] })
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.start('100'))
      .send({ duration: '21', startMode: 'LATER', startDate: '16/9/2026', suspendedUntil: '1/1/2027' })
      .expect(302)
      .then(() => {
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            otherPrivilege: 'library',
            startDate: '2026-09-16',
            endDate: '2026-10-06',
          }),
          '100',
        )
        expect(punishmentsService.addSessionPunishment.mock.calls[0][1]).not.toHaveProperty('suspendedUntil')
        expect(punishmentsService.markBatchItemAnswered).toHaveBeenCalledWith(expect.anything(), '100', 1, 'first')
      })
  })

  it('adds a suspended punishment without a start date, and does not ask about rehabilitative activities', () => {
    withBatch({ items: [{ type: PunishmentType.EARNINGS, stoppagePercentage: 20 }] })
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.start('100'))
      .send({ duration: '10', startMode: 'SUSPENDED', suspendedUntil: '31/10/2026' })
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentSchedule.urls.start('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.EARNINGS,
            privilegeType: null,
            otherPrivilege: null,
            stoppagePercentage: 20,
            duration: 10,
            suspendedUntil: '2026-10-31',
            rehabilitativeActivities: [],
          },
          '100',
        ),
      )
  })

  it('applies one answer to every punishment when they share a duration', () => {
    withBatch({ items: [canteen, library], sameForAll: true })
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.start('100'))
      .send({ duration: '7', startMode: 'IMMEDIATE' })
      .expect(302)
      .then(() => {
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledTimes(2)
        expect(punishmentsService.markBatchItemAnswered).toHaveBeenCalledWith(expect.anything(), '100', 0, 'first')
        expect(punishmentsService.markBatchItemAnswered).toHaveBeenCalledWith(expect.anything(), '100', 1, 'second')
      })
  })

  it('reports every missing answer', () => {
    withBatch({ items: [canteen] })
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.start('100'))
      .send({})
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Enter how many days the punishment will last')
        expect(res.text).toContain('Select when this punishment will take effect')
        expect(punishmentsService.addSessionPunishment).not.toHaveBeenCalled()
      })
  })

  it.each([
    [{ duration: 'ten', startMode: 'IMMEDIATE' }, 'Number of days must be a whole number, like 21'],
    [{ duration: '5', startMode: 'LATER' }, 'Enter the date the punishment will start'],
    [{ duration: '5', startMode: 'LATER', startDate: '31/2/2026' }, 'Start date must be a real date'],
    [
      { duration: '5', startMode: 'LATER', startDate: '17/8/2026' },
      'Start date must be after the last day of the hearing, 17 August 2026',
    ],
    [{ duration: '5', startMode: 'SUSPENDED' }, 'Enter the date the punishment is suspended until'],
    [
      { duration: '5', startMode: 'SUSPENDED', suspendedUntil: '1/8/2026' },
      'Date suspended until must be after the last day of the hearing, 17 August 2026',
    ],
  ])('rejects %o', (body, message) => {
    withBatch({ items: [canteen] })
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.start('100'))
      .send(body)
      .expect(200)
      .expect(res => expect(res.text).toContain(message))
  })

  it('applies the YOI maximum for each punishment', () => {
    punishmentsService.getPunishmentAvailability.mockResolvedValue({
      isIndependentAdjudicatorHearing: false,
      isAdult: false,
    })
    withBatch({ items: [{ type: PunishmentType.CONFINEMENT }] })
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.start('100'))
      .send({ duration: '11', startMode: 'IMMEDIATE' })
      .expect(200)
      .expect(res => expect(res.text).toContain('Cellular confinement cannot be more than 10 days'))
  })
})

describe('changing a punishment', () => {
  const existing = {
    ...canteen,
    redisId: 'xyz',
    duration: 21,
    startDate: '2026-08-17',
    endDate: '2026-09-06',
    rehabilitativeActivities: [] as never[],
  }

  it('shows the saved answers', () => {
    punishmentsService.getSessionPunishment.mockReturnValue(existing)
    return request(app)
      .get(adjudicationUrls.punishmentDuration.urls.edit('100', 'xyz'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Loss of canteen: duration and start date')
        expect(res.text).toContain('value="21"')
        expect(res.text).toMatch(/value="IMMEDIATE" checked/)
      })
  })

  it('uses the type chosen on the type page', () => {
    punishmentsService.getSessionPunishment.mockReturnValue(existing)
    return request(app)
      .get(`${adjudicationUrls.punishmentDuration.urls.edit('100', 'xyz')}?punishmentType=PRIVILEGE&privilegeType=TV`)
      .expect(200)
      .expect(res => expect(res.text).toContain('Loss of TV: duration and start date'))
  })

  it('returns to the schedule when the punishment is in the batch being added', () => {
    punishmentsService.getSessionPunishment.mockReturnValue(existing)
    punishmentsService.isInPunishmentBatch.mockReturnValue(true)
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.edit('100', 'xyz'))
      .send({ duration: '14', startMode: 'SUSPENDED', suspendedUntil: '30/11/2026' })
      .expect(302)
      .expect('Location', adjudicationUrls.punishmentSchedule.urls.start('100'))
      .then(() => {
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ duration: 14, suspendedUntil: '2026-11-30' }),
          '100',
          'xyz',
        )
        expect(punishmentsService.noRehabilitativeActivities).not.toHaveBeenCalled()
      })
  })

  it('will not move the suspended-until date before a rehabilitative activity it keeps', () => {
    punishmentsService.getSessionPunishment.mockReturnValue({
      ...existing,
      startDate: undefined,
      endDate: undefined,
      suspendedUntil: '2026-11-30',
      rehabilitativeActivities: [{ sessionId: 1, details: 'Course', endDate: '2026-11-15' }],
    })
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.edit('100', 'xyz'))
      .send({ duration: '21', startMode: 'SUSPENDED', suspendedUntil: '1/11/2026' })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(
          'Date suspended until must be on or after 15 November 2026, when its rehabilitative activity must be completed',
        )
        expect(punishmentsService.updateSessionPunishment).not.toHaveBeenCalled()
      })
  })

  it('returns to the award punishments page otherwise, dropping activities from a punishment no longer suspended', () => {
    punishmentsService.getSessionPunishment.mockReturnValue(existing)
    punishmentsService.isInPunishmentBatch.mockReturnValue(false)
    return request(app)
      .post(adjudicationUrls.punishmentDuration.urls.edit('100', 'xyz'))
      .send({ duration: '14', startMode: 'IMMEDIATE' })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.noRehabilitativeActivities).toHaveBeenCalledWith(expect.anything(), '100', 'xyz'),
      )
  })
})
