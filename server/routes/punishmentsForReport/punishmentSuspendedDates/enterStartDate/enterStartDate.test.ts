import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import { PunishmentType } from '../../../../data/PunishmentResult'
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
        corrupted: false,
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
        corrupted: false,
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
        corrupted: false,
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
      .get(adjudicationUrls.suspendedPunishmentStartDate.urls.existing('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.suspendedPunishmentStartDate.urls.existing('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the date the punishment will start')
      })
  })
})

describe('POST ', () => {
  it('redirects to the punishment schedule page and saves to session', () => {
    return request(app)
      .post(
        `${adjudicationUrls.suspendedPunishmentStartDate.urls.existing(
          '100'
        )}?punishmentType=CONFINEMENT&punishmentNumberToActivate=72&days=6&startDate=`
      )
      .send({
        startDate: '13/12/2023',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.suspendedPunishmentAutoDates.urls.existing('100'))
      .then(() =>
        expect(punishmentsService.addSessionPunishment).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            type: PunishmentType.CONFINEMENT,
            days: 6,
            startDate: '2023-12-13',
            endDate: '2023-12-18',
            id: 72,
            activatedFrom: '102',
          }),
          '100'
        )
      )
  })
})
