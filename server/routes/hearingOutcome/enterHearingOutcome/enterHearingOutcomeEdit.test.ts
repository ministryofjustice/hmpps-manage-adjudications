import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import TestData from '../../testutils/testData'
import { HearingOutcomeCode } from '../../../data/HearingAndOutcomeResult'
import { OicHearingType } from '../../../data/ReportedAdjudicationResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>
const testData = new TestData()

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, hearingsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  hearingsService.getHearingOutcome.mockResolvedValue(
    testData.hearingOutcome({
      code: HearingOutcomeCode.REFER_POLICE,
      optionalItems: { details: 'A reason for referral' },
    })
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /hearing-outcome - edit', () => {
  it('should load the `Enter hearing outcome` page - no new search', () => {
    hearingsService.getHearingAdjudicatorType.mockResolvedValue(OicHearingType.GOV_ADULT)

    return request(app)
      .get(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the hearing outcome')
      })
  })
  it('should load the `Enter hearing outcome` page - new search', () => {
    hearingsService.getHearingAdjudicatorType.mockResolvedValue(OicHearingType.GOV_ADULT)

    return request(app)
      .get(`${adjudicationUrls.enterHearingOutcome.urls.edit(100)}?selectedPerson=RRED_GEN`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the hearing outcome')
      })
  })
})

describe('POST /hearing-outcome - edit - governor adjudicator', () => {
  it('should redirect to the correct URL - refer to police (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'REFER_POLICE',
        governorId: 'RRED_GEN',
        adjudicatorType: OicHearingType.GOV_ADULT,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(100)}?adjudicator=RRED_GEN&hearingOutcome=REFER_POLICE`
      )
  })
  it('should redirect to the correct URL - refer to independent adjudicator (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'REFER_INAD',
        governorId: 'RRED_GEN',
        adjudicatorType: OicHearingType.GOV_ADULT,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(100)}?adjudicator=RRED_GEN&hearingOutcome=REFER_INAD`
      )
  })
  it('should redirect to the correct URL - complete (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'COMPLETE',
        governorId: 'RRED_GEN',
        adjudicatorType: OicHearingType.GOV_ADULT,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(100)}?adjudicator=RRED_GEN&hearingOutcome=COMPLETE`
      )
  })
  it('should redirect to the correct URL - adjourn (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'ADJOURN',
        governorId: 'RRED_GEN',
        adjudicatorType: OicHearingType.GOV_ADULT,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingAdjourned.urls.edit(100)}?adjudicator=RRED_GEN&hearingOutcome=ADJOURN`
      )
  })
})
describe('POST /hearing-outcome - edit - independent adjudicator', () => {
  it('should redirect to the correct URL - refer to police (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'REFER_POLICE',
        inAdName: 'Rebecca Red',
        adjudicatorType: OicHearingType.INAD_YOI,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100
        )}?adjudicator=Rebecca%20Red&hearingOutcome=REFER_POLICE`
      )
  })
  it('should redirect to the correct URL - refer to independent adjudicator (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'REFER_INAD',
        inAdName: 'Rebecca Red',
        adjudicatorType: OicHearingType.INAD_YOI,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          100
        )}?adjudicator=Rebecca%20Red&hearingOutcome=REFER_INAD`
      )
  })
  it('should redirect to the correct URL - complete (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'COMPLETE',
        inAdName: 'Rebecca Red',
        adjudicatorType: OicHearingType.INAD_YOI,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingPleaAndFinding.urls.edit(100)}?adjudicator=Rebecca%20Red&hearingOutcome=COMPLETE`
      )
  })
  it('should redirect to the correct URL - adjourn (edit version)', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.edit(100))
      .send({
        hearingOutcome: 'ADJOURN',
        inAdName: 'Rebecca Red',
        adjudicatorType: OicHearingType.INAD_YOI,
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingAdjourned.urls.edit(100)}?adjudicator=Rebecca%20Red&hearingOutcome=ADJOURN`
      )
  })
})
