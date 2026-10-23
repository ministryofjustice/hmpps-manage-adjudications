import { Express } from 'express'
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

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getAllSessionPunishments.mockReturnValue([
    { redisId: 'changed', type: PunishmentType.PAYBACK, duration: 4, endDate: '2023-05-05', paybackNotes: 'Cleaning' },
    { redisId: 'other', type: PunishmentType.PAYBACK, duration: 9, endDate: '2023-06-30', paybackNotes: 'Garden' },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('Payback punishment schedule', () => {
  it('shows the punishment just added, which is last', () =>
    request(app)
      .get(adjudicationUrls.paybackPunishmentSchedule.urls.start('100'))
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Garden')
        expect(res.text).not.toContain('Cleaning')
      }))

  it('shows the punishment that was changed, which keeps its place in the list', () =>
    request(app)
      .get(`${adjudicationUrls.paybackPunishmentSchedule.urls.start('100')}?redisId=changed`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Cleaning')
        expect(res.text).not.toContain('Garden')
        expect(res.text).toContain(adjudicationUrls.paybackPunishmentDuration.urls.edit('100', 'changed'))
      }))
})
