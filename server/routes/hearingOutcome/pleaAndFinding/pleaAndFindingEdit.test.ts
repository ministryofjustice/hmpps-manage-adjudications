import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import { HearingOutcomeCode, HearingOutcomeFinding, HearingOutcomePlea } from '../../../data/HearingAndOutcomeResult'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import TestData from '../../testutils/testData'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')
jest.mock('../../../services/reportedAdjudicationsService')

const testData = new TestData()
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>
const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, hearingsService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue({
    hearing: testData.singleHearing({
      dateTimeOfHearing: '2023-01-23T17:00:00',
      id: 1,
      locationId: 775,
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.COMPLETE,
        optionalItems: { plea: HearingOutcomePlea.GUILTY, finding: HearingOutcomeFinding.CHARGE_PROVED },
      }),
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /hearing-plea-finding edit', () => {
  it('should load the `Plea and finding` edit page', () => {
    return request(app)
      .get(adjudicationUrls.hearingPleaAndFinding.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Plea and finding')
      })
  })
})

describe('POST /hearing-plea-finding edit', () => {
  it('should redirect to the correct URL after correct submission - proved finding', () => {
    return request(app)
      .post(`${adjudicationUrls.hearingPleaAndFinding.urls.edit(100)}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`)
      .send({
        hearingPlea: HearingOutcomePlea.GUILTY,
        hearingFinding: HearingOutcomeFinding.CHARGE_PROVED,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.moneyRecoveredForDamages.urls.edit(100)}?adjudicator=Judge%20Red&plea=GUILTY`
      )
  })
  it('should redirect to the correct URL after correct submission - dismissed finding', () => {
    return request(app)
      .post(`${adjudicationUrls.hearingPleaAndFinding.urls.edit(100)}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`)
      .send({
        hearingPlea: HearingOutcomePlea.GUILTY,
        hearingFinding: HearingOutcomeFinding.DISMISSED,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForFinding.urls.edit(100)}?adjudicator=Judge%20Red&plea=GUILTY`
      )
  })
  it('should redirect to the correct URL after correct submission - not proceeded with finding', () => {
    return request(app)
      .post(`${adjudicationUrls.hearingPleaAndFinding.urls.edit(100)}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`)
      .send({
        hearingPlea: HearingOutcomePlea.GUILTY,
        hearingFinding: HearingOutcomeFinding.NOT_PROCEED,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.reasonForNotProceeding.urls.completeHearingEdit(100)}?adjudicator=Judge%20Red&plea=GUILTY`
      )
  })
  it('should use the query parameter adjudicator name rather than api adjudicator name if one is present', () => {
    return request(app)
      .post(`${adjudicationUrls.hearingPleaAndFinding.urls.edit(100)}?adjudicator=Judge%20Red&hearingOutcome=COMPLETE`)
      .send({
        hearingPlea: HearingOutcomePlea.GUILTY,
        hearingFinding: HearingOutcomeFinding.NOT_PROCEED,
        adjudicatorName: 'NameFrom Api',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.reasonForNotProceeding.urls.completeHearingEdit(100)}?adjudicator=Judge%20Red&plea=GUILTY`
      )
  })
})
