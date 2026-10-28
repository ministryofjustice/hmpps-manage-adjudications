import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PunishmentType } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

const paybackPunishment = {
  type: PunishmentType.PAYBACK,
  endDate: '2023-05-05',
  paybackNotes: 'Cleaning',
  duration: 4,
  rehabilitativeActivities: [] as never[],
}

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Payback punishment details', () => {
  it('adds the punishment and shows the schedule', () =>
    request(app)
      .post(`${adjudicationUrls.paybackPunishmentDetails.urls.start('100')}?duration=4&endDate=5/5/2023`)
      .send({ paybackNotes: 'Cleaning' })
      .expect(302)
      .expect('Location', adjudicationUrls.paybackPunishmentSchedule.urls.start('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          paybackPunishment,
          '100',
        ),
      ))

  it('changes the punishment and shows the schedule for it', () =>
    request(app)
      .post(`${adjudicationUrls.paybackPunishmentDetails.urls.edit('100', 'xyz')}?duration=4&endDate=5/5/2023`)
      .send({ paybackNotes: 'Cleaning' })
      .expect(302)
      .expect('Location', `${adjudicationUrls.paybackPunishmentSchedule.urls.start('100')}?redisId=xyz`)
      .then(() =>
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          paybackPunishment,
          '100',
          'xyz',
        ),
      ))

  it('asks for the details when none are given', () =>
    request(app)
      .post(`${adjudicationUrls.paybackPunishmentDetails.urls.start('100')}?duration=4&endDate=5/5/2023`)
      .send({})
      .expect(200)
      .expect(res => expect(res.text).toContain('There is a problem'))
      .then(() => expect(punishmentsService.addSessionPunishment).not.toHaveBeenCalled()))
})
