import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import TestData from '../../testutils/testData'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')
jest.mock('../../../services/reportedAdjudicationsService')

const testData = new TestData()

const userService = new UserService(null) as jest.Mocked<UserService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>
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
    outcome: testData.outcome({ caution: true }),
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

describe('GET /is-caution', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { hearingsService, userService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.isThisACaution.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /is-caution', () => {
  it('should load the `is caution` page', () => {
    return request(app)
      .get(adjudicationUrls.isThisACaution.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Is the punishment a caution?')
      })
  })
})

describe('POST /is-caution', () => {
  it('should successfully call the endpoint and redirect if answer is no', () => {
    return request(app)
      .post(`${adjudicationUrls.isThisACaution.urls.edit(100)}`)
      .send({
        caution: 'no',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
      .then(() =>
        expect(hearingsService.editChargeProvedOutcome).toHaveBeenCalledWith(
          100,
          false,
          expect.anything(),
          null,
          null,
          null,
          null
        )
      )
  })
  it('should not call the endpoint and redirect to the check answers page if answer is yes', () => {
    return request(app)
      .post(`${adjudicationUrls.isThisACaution.urls.edit(100)}`)
      .send({
        caution: 'yes',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingsCheckAnswers.urls.edit(100)}?adjudicator=&amount=&plea=&damagesOwed=`
      )
      .then(() => expect(hearingsService.createChargedProvedHearingOutcome).not.toHaveBeenCalled())
  })
})
