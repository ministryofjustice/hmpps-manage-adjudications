import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import OutcomesService from '../../services/outcomesService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { NotProceedReason } from '../../data/HearingAndOutcomeResult'
import TestData from '../testutils/testData'

jest.mock('../../services/userService')
jest.mock('../../services/outcomesService')
jest.mock('../../services/reportedAdjudicationsService')

const testData = new TestData()
const userService = new UserService(null, null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService(null) as jest.Mocked<OutcomesService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
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
    outcome: testData.outcome({ reason: NotProceedReason.ANOTHER_WAY, details: 'some details' }),
  },
}

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, outcomesService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue(outcomeHistory)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /not-proceed', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, outcomesService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForNotProceeding.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /not-proceed', () => {
  it('should load the `Not proceed` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForNotProceeding.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for not proceeding?')
      })
  })
})

describe('POST /not-proceed', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.reasonForNotProceeding.urls.edit(100)}`)
      .send({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: 'details',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
      .then(() =>
        expect(outcomesService.editNotProceedOutcome).toHaveBeenCalledWith(
          100,
          NotProceedReason.NOT_FAIR,
          'details',
          expect.anything()
        )
      )
  })
})
