import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null) as jest.Mocked<PunishmentsService>

let app: Express

const punishmentsOnSession = [
  {
    redisId: 'qwerty-123',
    type: PunishmentType.CONFINEMENT,
    days: 5,
    startDate: '2023-04-20',
    endDate: '2023-04-25',
  },
  {
    redisId: 'asdfg-123-erty',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.FACILITIES,
    days: 10,
    startDate: '2023-04-10',
    endDate: '2023-04-20',
  },
]

const suspendedPunishments = {
  prisonerName: 'James Wellbeloved',
  suspendedPunishments: [
    {
      reportNumber: 100,
      chargeNumber: '100',
      punishment: {
        id: 71,
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.MONEY,
        activatedBy: 0,
        activatedFrom: 0,
        schedule: {
          days: 5,
          suspendedUntil: '2023-04-29',
        },
      },
    },
    {
      reportNumber: 101,
      chargeNumber: '101',
      punishment: {
        id: 60,
        type: PunishmentType.CONFINEMENT,
        activatedBy: 0,
        activatedFrom: 0,
        schedule: {
          days: 5,
          suspendedUntil: '2023-05-20',
        },
      },
    },
  ],
}

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getSuspendedPunishmentDetails.mockResolvedValue(suspendedPunishments)
  punishmentsService.getSuspendedPunishment.mockResolvedValue(suspendedPunishments.suspendedPunishments)
  punishmentsService.getAllSessionPunishments.mockResolvedValue(punishmentsOnSession)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the correct page', () => {
    return request(app)
      .get(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Activate an existing suspended punishment')
      })
  })
  it('should call the endpoint to get suspended punishments', () => {
    return request(app)
      .get(adjudicationUrls.activateSuspendedPunishments.urls.start('100'))
      .expect('Content-Type', /html/)
      .then(() =>
        expect(punishmentsService.getSuspendedPunishmentDetails).toHaveBeenCalledWith('100', expect.anything())
      )
  })
})

describe('POST', () => {
  it('should redirect correctly', () => {
    return request(app)
      .post(`${adjudicationUrls.activateSuspendedPunishments.urls.start('100')}`)
      .send({
        activate: 'suspended-punishment-60',
      })
      .expect(
        'Location',
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.existing(
          '100'
        )}?punishmentNumberToActivate=60&punishmentType=PRIVILEGE&days=5`
      )
  })
})
