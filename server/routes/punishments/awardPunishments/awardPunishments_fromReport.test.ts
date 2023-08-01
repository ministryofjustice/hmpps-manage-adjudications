import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import PunishmentsService from '../../../services/punishmentsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/punishmentsService')
jest.mock('../../../services/userService')

const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

let app: Express
const punishmentsOnServer = [
  {
    type: PunishmentType.EARNINGS,
    privilegeType: null as null,
    otherPrivilege: null as null,
    stoppagePercentage: 10,
    schedule: {
      days: 1,
      suspendedUntil: null as null,
      startDate: '2023-04-10',
      endDate: '2023-04-11',
    },
  },
]

beforeEach(() => {
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])

  punishmentsService.getPunishmentsFromServer.mockResolvedValue(punishmentsOnServer)
  punishmentsService.getAllSessionPunishments.mockReturnValueOnce(punishmentsOnServer)

  app = appWithAllRoutes({ production: false }, { punishmentsService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should load the page with details from the server', () => {
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain(`Stoppage of earnings: 10%`)
      })
  })
  it('should get data from server', () => {
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.start(100))
      .expect(200)
      .then(() => expect(punishmentsService.getPunishmentsFromServer).toHaveBeenCalledWith(100, expect.anything()))
      .then(() => expect(punishmentsService.getPunishmentsFromServer).toHaveBeenCalledTimes(2))
      .then(() => expect(punishmentsService.setAllSessionPunishments).toHaveBeenCalled())
      .then(() => expect(punishmentsService.getAllSessionPunishments).toHaveBeenCalledWith(expect.anything(), 100))
  })
  it('should call delete function if url contains delete query', () => {
    return request(app)
      .get(`${adjudicationUrls.awardPunishments.urls.start(100)}?delete=redisId`)
      .then(() => {
        expect(punishmentsService.deleteSessionPunishments).toHaveBeenCalledWith(expect.anything(), 'redisId', 100)
      })
  })
})
