import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import PunishmentsService from '../../services/punishmentsService'
import { PunishmentType } from '../../data/PunishmentResult'

jest.mock('../../services/userService')
jest.mock('../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSuspendedPunishmentDetails.mockResolvedValue({
    prisonerName: 'G6123VU',
    suspendedPunishments: [
      {
        reportNumber: 102,
        punishment: {
          id: 72,
          type: PunishmentType.CONFINEMENT,
          schedule: {
            days: 10,
            suspendedUntil: '30/5/2023',
          },
        },
      },
      {
        reportNumber: 103,
        punishment: {
          id: 73,
          type: PunishmentType.ADDITIONAL_DAYS,
          schedule: {
            days: 5,
            suspendedUntil: '30/5/2023',
          },
        },
      },
      {
        reportNumber: 104,
        punishment: {
          id: 74,
          type: PunishmentType.PROSPECTIVE_DAYS,
          schedule: {
            days: 3,
            suspendedUntil: '18/5/2023',
          },
        },
      },
    ],
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET suspended punishment schedule', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(100)}?days=10`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET suspended punishment schedule', () => {
  it('should load the `Not proceed` page', () => {
    return request(app)
      .get(`${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(100)}?days=10`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Punishment schedule')
      })
  })
})

describe('POST suspended punishment schedule', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(
          100
        )}?punishmentType=CONFINEMENT&punishmentNumberToActivate=72`
      )
      .send({
        days: 10,
        startDate: '3/4/2023',
        endDate: '13/4/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified(100))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            id: 72,
            redisId: expect.anything(),
            type: PunishmentType.CONFINEMENT,
            days: 10,
            startDate: '2023-04-03',
            endDate: '2023-04-13',
            activatedFrom: 102,
          },
          100
        )
      )
  })
  it('should successfully call the endpoint and redirect - additional days', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(
          100
        )}?punishmentType=ADDITIONAL_DAYS&punishmentNumberToActivate=73`
      )
      .send({
        days: 5,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified(100))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            id: 73,
            redisId: expect.anything(),
            type: PunishmentType.ADDITIONAL_DAYS,
            days: 5,
            activatedFrom: 103,
          },
          100
        )
      )
  })
  it('should successfully call the endpoint and redirect - prospective additional days', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(
          100
        )}?punishmentType=PROSPECTIVE_DAYS&punishmentNumberToActivate=74`
      )
      .send({
        days: 3,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified(100))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            id: 74,
            redisId: expect.anything(),
            type: PunishmentType.PROSPECTIVE_DAYS,
            days: 3,
            activatedFrom: 104,
          },
          100
        )
      )
  })
})
