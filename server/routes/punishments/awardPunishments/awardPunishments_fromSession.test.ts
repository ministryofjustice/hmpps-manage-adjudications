import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import PunishmentsService from '../../../services/punishmentsService'
import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/punishmentsService')
jest.mock('../../../services/userService')

const punishmentsService = new PunishmentsService(null) as jest.Mocked<PunishmentsService>
const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

const punishmentsOnSession = [
  {
    type: PunishmentType.EARNINGS,
    privilegeType: null as null,
    otherPrivilege: null as null,
    stoppagePercentage: 10,
    days: 1,
    suspendedUntil: null as null,
    startDate: '2023-04-10',
    endDate: '2023-04-11',
  },
  {
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.OTHER,
    otherPrivilege: 'Chocolate',
    stoppagePercentage: null as null,
    days: 10,
    suspendedUntil: null as null,
    startDate: '2023-04-10',
    endDate: '2023-04-20',
  },
  {
    type: PunishmentType.CONFINEMENT,
    privilegeType: null as null,
    otherPrivilege: null as null,
    stoppagePercentage: null as null,
    days: 10,
    suspendedUntil: '2023-04-28',
    startDate: null as null,
    endDate: null as null,
  },
]

beforeEach(() => {
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])

  punishmentsService.getPunishmentsFromServer.mockResolvedValue([])

  punishmentsService.getAllSessionPunishments.mockReturnValueOnce(punishmentsOnSession)

  app = appWithAllRoutes({ production: false }, { punishmentsService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should load the page with details from the session', () => {
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Loss of chocolate')
        expect(res.text).toContain(`Stoppage of earnings: 10%`)
        expect(res.text).toContain('Cellular confinement')
      })
  })
  it('should use the session service to get data', () => {
    return request(app)
      .get(adjudicationUrls.awardPunishments.urls.modified('100'))
      .expect(200)
      .then(() => expect(punishmentsService.setAllSessionPunishments).not.toHaveBeenCalled())
      .then(() => expect(punishmentsService.getPunishmentsFromServer).toHaveBeenCalledTimes(1))
      .then(() => expect(punishmentsService.getAllSessionPunishments).toHaveBeenCalledWith(expect.anything(), 100))
  })
})
