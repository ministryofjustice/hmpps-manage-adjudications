import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import TestData from '../../testutils/testData'
import { PrivilegeType, PunishmentMeasurement, PunishmentType } from '../../../data/PunishmentResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')
jest.mock('../../../services/reportedAdjudicationsService')

const testData = new TestData()

const userService = new UserService(null, null) as jest.Mocked<UserService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

const outcomeHistory = {
  hearing: testData.singleHearing({
    dateTimeOfHearing: '2023-03-10T22:00:00',
  }),
  outcome: {
    outcome: testData.outcome({}),
  },
}

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { hearingsService, userService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue(outcomeHistory)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { hearingsService, userService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingsCheckAnswers.urls.edit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /', () => {
  it('should load the page', () => {
    return request(app)
      .get(
        `${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?adjudicator=JGREEN&plea=UNFIT&finding=CHARGE_PROVED`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Check your answers before submitting')
      })
  })
})

describe('POST', () => {
  it('should successfully call the endpoint and redirect', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber: '1524493',
        prisonerNumber: 'G6415GD',
        outcomes: [],
        punishments: [],
      }),
    })
    return request(app)
      .post(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?adjudicator=JGREEN&plea=NOT_ASKED`)
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.start('100'))
      .then(() =>
        expect(hearingsService.editChargeProvedOutcome).toHaveBeenCalledWith(
          '100',
          expect.anything(),
          'JGREEN',
          'NOT_ASKED'
        )
      )
  })

  it('should successfully call the endpoint and redirect', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: testData.reportedAdjudication({
        chargeNumber: '1524493',
        prisonerNumber: 'G6415GD',
        outcomes: [],
        punishments: [
          {
            id: 14,
            type: PunishmentType.PRIVILEGE,
            privilegeType: PrivilegeType.OTHER,
            otherPrivilege: 'chocolate',
            schedule: {
              duration: 10,
              measurement: PunishmentMeasurement.DAYS,
              startDate: '2023-04-10',
              endDate: '2023-04-20',
            },
          },
        ],
      }),
    })
    return request(app)
      .post(`${adjudicationUrls.hearingsCheckAnswers.urls.edit('100')}?adjudicator=JGREEN&plea=NOT_ASKED`)
      .expect(302)
      .expect('Location', adjudicationUrls.awardPunishments.urls.modified('100'))
      .then(() =>
        expect(hearingsService.editChargeProvedOutcome).toHaveBeenCalledWith(
          '100',
          expect.anything(),
          'JGREEN',
          'NOT_ASKED'
        )
      )
  })
})
