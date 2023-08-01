import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import {
  HearingOutcomeAdjournReason,
  HearingOutcomeCode,
  HearingOutcomePlea,
} from '../../../data/HearingAndOutcomeResult'
import TestData from '../../testutils/testData'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

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
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { hearingsService, userService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue({
    hearing: testData.singleHearing({
      dateTimeOfHearing: '2023-03-14T18:00:00',
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.ADJOURN,
        optionalItems: { details: 'adjourn details' },
      }),
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /hearing-adjourned', () => {
  it('should load the `adjourn edit` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingAdjourned.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjourn the hearing for another reason')
      })
  })
})

describe('POST /hearing-adjourned', () => {
  it('should successfully call the endpoint and redirect to the confirmation page - no adjudicator passed in', () => {
    return request(app)
      .post(adjudicationUrls.hearingAdjourned.urls.edit(100))
      .send({
        adjournReason: HearingOutcomeAdjournReason.INVESTIGATION,
        adjournDetails: '123',
        adjournPlea: HearingOutcomePlea.UNFIT,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
      .then(() => expect(hearingsService.createAdjourn).not.toHaveBeenCalled())
      .then(() =>
        expect(hearingsService.editAdjournHearingOutcome).toHaveBeenCalledWith(
          100,
          '123',
          HearingOutcomeAdjournReason.INVESTIGATION,
          HearingOutcomePlea.UNFIT,
          expect.anything(),
          undefined
        )
      )
  })
  it('should successfully call the endpoint and redirect to the confirmation page - adjudicator passed in', () => {
    return request(app)
      .post(`${adjudicationUrls.hearingAdjourned.urls.edit(100)}?adjudicator=Rebecca%20Red`)
      .send({
        adjournReason: HearingOutcomeAdjournReason.INVESTIGATION,
        adjournDetails: '123',
        adjournPlea: HearingOutcomePlea.UNFIT,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
      .then(() => expect(hearingsService.createAdjourn).not.toHaveBeenCalled())
      .then(() =>
        expect(hearingsService.editAdjournHearingOutcome).toHaveBeenCalledWith(
          100,
          '123',
          HearingOutcomeAdjournReason.INVESTIGATION,
          HearingOutcomePlea.UNFIT,
          expect.anything(),
          'Rebecca Red'
        )
      )
  })
})
