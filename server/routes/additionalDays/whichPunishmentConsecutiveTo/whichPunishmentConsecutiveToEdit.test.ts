import { Express } from 'express'
import request from 'supertest'
import { v4 as uuidv4 } from 'uuid'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null) as jest.Mocked<PunishmentsService>

let app: Express

const consecutivePunishments = [
  {
    reportNumber: 101,
    chargeProvedDate: '2023-07-18',
    punishment: {
      id: 1,
      type: PunishmentType.ADDITIONAL_DAYS,
      schedule: {
        days: 5,
      },
    },
  },
  {
    reportNumber: 102,
    chargeProvedDate: '2023-07-19',
    punishment: {
      id: 2,
      type: PunishmentType.ADDITIONAL_DAYS,
      schedule: {
        days: 2,
      },
      consecutiveReportNumber: 99,
      consecutiveReportAvailable: true,
    },
  },
]

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { punishmentsService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  punishmentsService.getPossibleConsecutivePunishments.mockResolvedValue(consecutivePunishments)
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
      .get(adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.edit('100', uuidv4()))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the correct page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.edit('100', uuidv4())}?punishmentType=ADDITIONAL_DAYS`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Which punishment will it be consecutive to?')
      })
  })
  it('should call the endpoint to get consecutive punishments', () => {
    return request(app)
      .get(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.edit('100', uuidv4())}?punishmentType=ADDITIONAL_DAYS`
      )
      .expect('Content-Type', /html/)
      .then(() =>
        expect(punishmentsService.getPossibleConsecutivePunishments).toHaveBeenCalledWith(
          '100',
          PunishmentType.ADDITIONAL_DAYS,
          expect.anything()
        )
      )
  })
})

describe('POST', () => {
  it('should update punishment to session with consecutive punishment report number present', () => {
    return request(app)
      .post(
        `${adjudicationUrls.whichPunishmentIsItConsecutiveTo.urls.edit(
          '100',
          uuidv4()
        )}?punishmentType=ADDITIONAL_DAYS&days=5`
      )
      .send({
        select: 'consecutive-punishment-report-101',
      })
      .then(() => {
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.ADDITIONAL_DAYS,
            days: 5,
            consecutiveReportNumber: 101,
            otherPrivilege: null,
            privilegeType: null,
            stoppagePercentage: null,
          },
          '100',
          expect.anything()
        )
      })
  })
})
