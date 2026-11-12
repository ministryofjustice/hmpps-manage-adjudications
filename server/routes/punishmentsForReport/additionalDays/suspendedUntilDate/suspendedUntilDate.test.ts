import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/reportedAdjudicationsService.ts')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null,
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.punishmentSuspendedUntilAdditionalDays.urls.start(
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=6`,
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.punishmentSuspendedUntilAdditionalDays.urls.start(
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=6`,
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the date the punishment is suspended until')
      })
  })
})

describe('POST ', () => {
  it('redirects to the award punishment page and saves to session', () => {
    return request(app)
      .post(
        `${adjudicationUrls.punishmentSuspendedUntilAdditionalDays.urls.start(
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=6`,
      )
      .send({
        suspendedUntil: '13/12/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PRIVILEGE,
            privilegeType: PrivilegeType.OTHER,
            otherPrivilege: 'nintendo switch',
            duration: 6,
            suspendedUntil: '2023-12-13',
            stoppagePercentage: null,
            rehabilitativeActivities: [],
          },
          '100',
        ),
      )
  })
})

describe('Validations', () => {
  beforeEach(() => {
    punishmentsService.getLastHearingDate.mockResolvedValue('2026-08-17')
  })
  it.each([
    { scenario: 'No date entered', message: 'Enter the date the punishment is suspended until' },
    {
      scenario: 'Date before hearing date',
      suspendedUntil: '16/8/2026',
      message: 'Date suspended until must be after the last day of the hearing, 17 August 2026',
    },
    {
      scenario: 'Date more than 6 months after hearing date',
      suspendedUntil: '18/2/2027',
      message: 'Date suspended cannot be later than 6 months after the last day of the hearing, 17 February 2027',
    },
  ])('Error message triggered when: %scenario', ({ suspendedUntil, message }) => {
    return request(app)
      .post(
        `${adjudicationUrls.punishmentSuspendedUntilAdditionalDays.urls.start(
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=6`,
      )
      .send({
        suspendedUntil,
      })
      .expect(200)
      .expect(res => expect(res.text).toContain(message))
  })
})
