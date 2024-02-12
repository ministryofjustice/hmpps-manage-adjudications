import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../../testutils/appSetup'
import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import OutcomesService from '../../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import TestData from '../../../testutils/testData'

jest.mock('../../../../services/userService')
jest.mock('../../../../services/outcomesService')
jest.mock('../../../../services/reportedAdjudicationsService')

const testData = new TestData()
const userService = new UserService(null, null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService() as jest.Mocked<OutcomesService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { outcomesService, userService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue({
    outcome: {
      outcome: testData.outcome({}),
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /reason-for-police-referral', () => {
  beforeEach(() => {
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForReferral.urls.edit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /reason-for-police-referral', () => {
  it('should load the `Reason for referral` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForReferral.urls.edit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for the referral?')
      })
  })
})

describe('POST /reason-for-police-referral', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(adjudicationUrls.reasonForReferral.urls.edit('100'))
      .send({
        referralReason: '123',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
      .then(() => expect(outcomesService.createPoliceReferral).not.toHaveBeenCalled)
      .then(() => expect(outcomesService.editReferralOutcome).toHaveBeenCalledWith('100', '123', expect.anything()))
  })
})
