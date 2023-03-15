import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import TestData from '../../testutils/testData'

const testData = new TestData()

jest.mock('../../../services/userService')
jest.mock('../../../services/reportedAdjudicationsService')

const userService = new UserService(null) as jest.Mocked<UserService>
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
    outcome: testData.outcome({ amount: 100.0 }),
  },
}

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue(outcomeHistory)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /money-recovered', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, reportedAdjudicationsService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.moneyRecoveredForDamages.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /money-recovered', () => {
  it('should load the `Damages owed page` page with correct values', () => {
    return request(app)
      .get(adjudicationUrls.moneyRecoveredForDamages.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('100.00')
      })
  })
})

describe('POST /money-recovered', () => {
  it('should pass the amount to the next edit page', () => {
    return request(app)
      .post(`${adjudicationUrls.moneyRecoveredForDamages.urls.edit(100)}`)
      .send({
        damagesOwed: 'yes',
        amount: '100.10',
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.isThisACaution.urls.edit(100)}?adjudicator=&plea=&amount=100.10`)
  })
  it('should  not pass the amount to the edit next page', () => {
    return request(app)
      .post(`${adjudicationUrls.moneyRecoveredForDamages.urls.edit(100)}`)
      .send({
        damagesOwed: 'no',
        amount: null,
      })
      .expect(302)
      .expect('Location', `${adjudicationUrls.isThisACaution.urls.edit(100)}?adjudicator=&plea=&amount=`)
  })
})
