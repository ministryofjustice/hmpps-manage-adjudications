import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import TestData from '../../testutils/testData'
import { PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/punishmentsService')
jest.mock('../../../services/reportedAdjudicationsService.ts')

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
      chargeNumber: '100',
      prisonerNumber: 'G6123VU',
      dateTimeOfIncident: '2023-08-31T12:54:09.197Z',
      hearings: [
        testData.singleHearing({
          dateTimeOfHearing: '2023-09-02T10:50:00.000Z',
        }),
        testData.singleHearing({
          dateTimeOfHearing: '2023-09-03T12:00:00.000Z',
        }),
      ],
    }),
  })
  punishmentsService.getSuspendedPunishmentDetails.mockResolvedValue({
    prisonerName: 'G6123VU',
    suspendedPunishments: [
      {
        chargeNumber: '102',
        punishment: {
          id: 72,
          type: PunishmentType.CONFINEMENT,
          schedule: {
            days: 10,
            suspendedUntil: '30/5/2023',
          },
        },
      },
      {
        chargeNumber: '103',
        punishment: {
          id: 73,
          type: PunishmentType.ADDITIONAL_DAYS,
          schedule: {
            days: 5,
            suspendedUntil: '30/5/2023',
          },
        },
      },
      {
        chargeNumber: '104',
        punishment: {
          id: 74,
          type: PunishmentType.PROSPECTIVE_DAYS,
          schedule: {
            days: 3,
            suspendedUntil: '18/5/2023',
          },
        },
      },
    ],
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
      .get(adjudicationUrls.suspendedPunishmentStartDateChoice.urls.edit('100', 'xyz'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.suspendedPunishmentStartDateChoice.urls.edit('100', 'xyz'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('When will this punishment start?')
      })
  })
})

describe('POST ', () => {
  it('redirects to the schedule page if user selects immediate', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentStartDateChoice.urls.edit(
          '100',
          'xyz'
        )}?punishmentType=CONFINEMENT&punishmentNumberToActivate=72`
      )
      .send({
        immediate: 'true',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.suspendedPunishmentAutoDates.urls.existing(
          '100'
        )}?punishmentType=CONFINEMENT&privilegeType=&otherPrivilege=&stoppagePercentage=&days=&startDate=03%2F09%2F2023&punishmentNumberToActivate=72`
      )
      .then(() => {
        expect(punishmentsService.updateSessionPunishment).toHaveBeenCalled()
      })
  })
  it('redirects to the enter start date page if user does not select another date', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentStartDateChoice.urls.edit(
          '100',
          'xyz'
        )}?punishmentType=CONFINEMENT&punishmentNumberToActivate=72`
      )
      .send({
        immediate: 'false',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.suspendedPunishmentStartDate.urls.edit(
          '100',
          'xyz'
        )}?punishmentType=CONFINEMENT&privilegeType=&otherPrivilege=&stoppagePercentage=&days=&startDate=&punishmentNumberToActivate=72`
      )
  })
})
