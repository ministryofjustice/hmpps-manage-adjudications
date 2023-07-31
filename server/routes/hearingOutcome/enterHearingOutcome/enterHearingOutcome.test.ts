import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import { OicHearingType } from '../../../data/ReportedAdjudicationResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/hearingsService')

const userService = new UserService(null) as jest.Mocked<UserService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, hearingsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /hearing-outcome', () => {
  it('should load the `Enter hearing outcome` page', () => {
    hearingsService.getHearingAdjudicatorType.mockResolvedValue(OicHearingType.GOV_ADULT)

    return request(app)
      .get(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the hearing outcome')
      })
  })
})

describe('POST /hearing-outcome independent adjudicator', () => {
  it('should redirect to the correct URL - refer to police', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .send({
        adjudicatorType: OicHearingType.INAD_ADULT,
        hearingOutcome: 'REFER_POLICE',
        inAdName: 'Roxanne Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          '100'
        )}?adjudicator=Roxanne%20Red&hearingOutcome=REFER_POLICE`
      )
  })
  it('should redirect to the correct URL - refer to independent adjudicator', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .send({
        adjudicatorType: OicHearingType.INAD_ADULT,
        hearingOutcome: 'REFER_INAD',
        inAdName: 'Roxanne Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          '100'
        )}?adjudicator=Roxanne%20Red&hearingOutcome=REFER_INAD`
      )
  })
  it('should redirect to the correct URL - complete', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .send({
        adjudicatorType: OicHearingType.INAD_ADULT,
        hearingOutcome: 'COMPLETE',
        inAdName: 'Roxanne Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingPleaAndFinding.urls.start('100')}?adjudicator=Roxanne%20Red&hearingOutcome=COMPLETE`
      )
  })
  it('should redirect to the correct URL - adjourn', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .send({
        adjudicatorType: OicHearingType.INAD_ADULT,
        hearingOutcome: 'ADJOURN',
        inAdName: 'Roxanne Red',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingAdjourned.urls.start('100')}?adjudicator=Roxanne%20Red&hearingOutcome=ADJOURN`
      )
  })
})
describe('POST /hearing-outcome governor', () => {
  it('should redirect to the correct URL - refer to police', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .send({
        adjudicatorType: OicHearingType.GOV_ADULT,
        hearingOutcome: 'REFER_POLICE',
        governorId: 'RRED_GEN',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.start(
          '100'
        )}?adjudicator=RRED_GEN&hearingOutcome=REFER_POLICE`
      )
  })
  it('should redirect to the correct URL - refer to independent adjudicator', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .send({
        adjudicatorType: OicHearingType.INAD_ADULT,
        hearingOutcome: 'REFER_INAD',
        inAdName: 'RRED_GEN',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingReasonForReferral.urls.start('100')}?adjudicator=RRED_GEN&hearingOutcome=REFER_INAD`
      )
  })
  it('should redirect to the correct URL - complete', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .send({
        adjudicatorType: OicHearingType.INAD_ADULT,
        hearingOutcome: 'COMPLETE',
        inAdName: 'RRED_GEN',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingPleaAndFinding.urls.start('100')}?adjudicator=RRED_GEN&hearingOutcome=COMPLETE`
      )
  })
  it('should redirect to the correct URL - adjourn', () => {
    return request(app)
      .post(adjudicationUrls.enterHearingOutcome.urls.start('100'))
      .send({
        adjudicatorType: OicHearingType.INAD_ADULT,
        hearingOutcome: 'ADJOURN',
        inAdName: 'RRED_GEN',
      })
      .expect(302)
      .expect(
        'Location',
        `${adjudicationUrls.hearingAdjourned.urls.start('100')}?adjudicator=RRED_GEN&hearingOutcome=ADJOURN`
      )
  })
})
