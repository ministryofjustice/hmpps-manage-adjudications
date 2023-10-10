import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import TestData from '../../testutils/testData'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')
jest.mock('../../../services/reportedAdjudicationsService')

const testData = new TestData()
const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      chargeNumber: '1524494',
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2022-10-31T12:54:09.197Z',
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe.skip('GET suspended punishment schedule', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.suspendedPunishmentSchedule.urls.manual('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET suspended punishment schedule', () => {
  it('should load the `Not proceed` page', () => {
    return request(app)
      .get(adjudicationUrls.suspendedPunishmentSchedule.urls.manual('100'))
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
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.manual('100')}?punishmentType=CONFINEMENT&reportNo=123456`
      )
      .send({
        days: 10,
        startDate: '3/4/2023',
        endDate: '13/4/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.CONFINEMENT,
            days: 10,
            startDate: '2023-04-03',
            endDate: '2023-04-13',
            stoppagePercentage: null,
            otherPrivilege: null,
            privilegeType: null,
            activatedFrom: '123456',
          },
          '100'
        )
      )
  })
  it('should successfully call the endpoint and redirect - earnings', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.manual(
          '100'
        )}?punishmentType=EARNINGS&stoppagePercentage=10&reportNo=123456`
      )
      .send({
        days: 10,
        startDate: '3/4/2023',
        endDate: '13/4/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.EARNINGS,
            days: 10,
            startDate: '2023-04-03',
            endDate: '2023-04-13',
            stoppagePercentage: 10,
            otherPrivilege: null,
            privilegeType: null,
            activatedFrom: '123456',
          },
          '100'
        )
      )
  })
  it('should successfully call the endpoint and redirect - privilege tv', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.manual(
          '100'
        )}?punishmentType=PRIVILEGE&privilegeType=TV&reportNo=123456`
      )
      .send({
        days: 10,
        startDate: '3/4/2023',
        endDate: '13/4/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PRIVILEGE,
            days: 10,
            startDate: '2023-04-03',
            endDate: '2023-04-13',
            stoppagePercentage: null,
            otherPrivilege: null,
            privilegeType: PrivilegeType.TV,
            activatedFrom: '123456',
          },
          '100'
        )
      )
  })
  it('should successfully call the endpoint and redirect - privilege other', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.manual(
          '100'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=chocolate&reportNo=123456`
      )
      .send({
        days: 10,
        startDate: '3/4/2023',
        endDate: '13/4/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PRIVILEGE,
            days: 10,
            startDate: '2023-04-03',
            endDate: '2023-04-13',
            stoppagePercentage: null,
            otherPrivilege: 'chocolate',
            privilegeType: PrivilegeType.OTHER,
            activatedFrom: '123456',
          },
          '100'
        )
      )
  })
  it('should successfully call the endpoint and redirect - additional days', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.manual(
          '100'
        )}?punishmentType=ADDITIONAL_DAYS&reportNo=123456`
      )
      .send({
        days: 5,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.ADDITIONAL_DAYS,
            days: 5,
            activatedFrom: '123456',
            endDate: null,
            startDate: null,
            otherPrivilege: null,
            privilegeType: null,
            stoppagePercentage: null,
          },
          '100'
        )
      )
  })
  it('should successfully call the endpoint and redirect - prospective additional days', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentSchedule.urls.manual(
          '100'
        )}?punishmentType=PROSPECTIVE_DAYS&reportNo=123456`
      )
      .send({
        days: 3,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          {
            type: PunishmentType.PROSPECTIVE_DAYS,
            days: 3,
            activatedFrom: '123456',
            endDate: null,
            startDate: null,
            otherPrivilege: null,
            privilegeType: null,
            stoppagePercentage: null,
          },
          '100'
        )
      )
  })
})
