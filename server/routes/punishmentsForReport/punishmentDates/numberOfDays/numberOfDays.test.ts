import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import TestData from '../../../testutils/testData'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/punishmentsService')
jest.mock('../../../../services/reportedAdjudicationsService.ts')

const testData = new TestData()
const userService = new UserService(null, null) as jest.Mocked<UserService>
const punishmentsService = new PunishmentsService(null, null) as jest.Mocked<PunishmentsService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
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

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, punishmentsService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.punishmentNumberOfDays.urls.start(
          '100'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`
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
        `${adjudicationUrls.punishmentNumberOfDays.urls.start(
          '100'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the number of days this punishment will last')
      })
  })
})

describe('POST ', () => {
  it('redirects to the is the punishment suspended page', () => {
    return request(app)
      .post(
        `${adjudicationUrls.punishmentNumberOfDays.urls.start(
          '100'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`
      )
      .send({
        duration: 2,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentIsSuspended.urls.start(
          '100'
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=2`
      )
  })
})
