import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import TestData from '../../../testutils/testData'
import { PunishmentType } from '../../../../data/PunishmentResult'

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
  null,
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
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`,
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
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`,
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
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=`,
      )
      .send({
        duration: 2,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentIsSuspended.urls.start(
          '100',
        )}?punishmentType=PRIVILEGE&privilegeType=OTHER&otherPrivilege=nintendo%20switch&stoppagePercentage=&duration=2`,
      )
  })

  it('shows the ticket validation message and keeps the invalid loss duration editable', () => {
    return request(app)
      .post(
        `${adjudicationUrls.punishmentNumberOfDays.urls.start(
          '100',
        )}?punishmentType=${PunishmentType.LOSS_OF_SOCIAL_VISITS}&hasChildUnder18=false`,
      )
      .send({ duration: 28 })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Days for Loss of Social Visits cannot be more than 27 days')
        expect(res.text).toContain('value="28"')
      })
  })

  it('accepts the corrected maximum loss duration and carries the child answer forward', () => {
    return request(app)
      .post(
        `${adjudicationUrls.punishmentNumberOfDays.urls.start(
          '100',
        )}?punishmentType=${PunishmentType.LOSS_OF_SOCIAL_VISITS}&hasChildUnder18=false`,
      )
      .send({ duration: 27 })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.punishmentIsSuspended.urls.start(
          '100',
        )}?punishmentType=LOSS_OF_SOCIAL_VISITS&privilegeType=&otherPrivilege=&stoppagePercentage=&hasChildUnder18=false&duration=27`,
      )
  })
})
