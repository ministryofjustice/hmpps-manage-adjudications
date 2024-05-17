import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import { PrivilegeType, PunishmentType, RehabilitativeActivity } from '../../../../data/PunishmentResult'
import { ReportedAdjudicationStatus } from '../../../../data/ReportedAdjudicationResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>

let app: Express

const punishmentsOnSession = [
  {
    redisId: 'qwerty-123',
    type: PunishmentType.CONFINEMENT,
    duration: 5,
    startDate: '2023-04-20',
    endDate: '2023-04-25',
  },
  {
    redisId: 'asdfg-123-erty',
    type: PunishmentType.PRIVILEGE,
    privilegeType: PrivilegeType.FACILITIES,
    duration: 10,
    startDate: '2023-04-10',
    endDate: '2023-04-20',
  },
]

const suspendedPunishments = {
  prisonerName: 'James Wellbeloved',
  status: ReportedAdjudicationStatus.CHARGE_PROVED,
  suspendedPunishments: [
    {
      chargeNumber: '100',
      corrupted: false,
      punishment: {
        id: 71,
        type: PunishmentType.PRIVILEGE,
        privilegeType: PrivilegeType.MONEY,
        activatedBy: '0',
        activatedFrom: '0',
        rehabilitativeActivities: [] as RehabilitativeActivity[],
        schedule: {
          duration: 5,
          suspendedUntil: '2023-04-29',
        },
      },
    },
    {
      chargeNumber: '101',
      corrupted: false,
      punishment: {
        id: 60,
        type: PunishmentType.CONFINEMENT,
        activatedBy: '0',
        activatedFrom: '0',
        rehabilitativeActivities: [] as RehabilitativeActivity[],
        schedule: {
          duration: 5,
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
        `${adjudicationUrls.suspendedPunishmentNumberOfDays.urls.existing(
          '100'
        )}?punishmentNumberToActivate=60&punishmentType=PRIVILEGE&duration=5`
      )
  })
})
