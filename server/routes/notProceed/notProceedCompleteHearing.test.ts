import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import OutcomesService from '../../services/outcomesService'
import { HearingOutcomePlea, NotProceedReason } from '../../data/HearingAndOutcomeResult'
import HearingsService from '../../services/hearingsService'

jest.mock('../../services/userService')
jest.mock('../../services/outcomesService')
jest.mock('../../services/hearingsService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService() as jest.Mocked<OutcomesService>
const hearingsService = new HearingsService(null) as jest.Mocked<HearingsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, outcomesService, hearingsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /not-proceed', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, outcomesService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForNotProceeding.urls.completeHearingStart('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /not-proceed', () => {
  it('should load the `Not proceed` page', () => {
    return request(app)
      .get(adjudicationUrls.reasonForNotProceeding.urls.completeHearingStart('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for not proceeding?')
      })
  })
})

describe('POST /not-proceed', () => {
  it('should redirect back to the enter hearing outcome page if the adjudicator and plea are missing from the query', () => {
    return request(app)
      .post(adjudicationUrls.reasonForNotProceeding.urls.completeHearingStart('100'))
      .send({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: 'details',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.enterHearingOutcome.urls.start('100'))
  })
  it('should call the correct endpoint (createNotProceedHearingOutcome) and redirect', () => {
    return request(app)
      .post(
        `${adjudicationUrls.reasonForNotProceeding.urls.completeHearingStart('100')}?adjudicator=Rod%20Red&plea=UNFIT`
      )
      .send({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: 'details',
      })
      .then(() =>
        expect(hearingsService.createNotProceedHearingOutcome).toHaveBeenCalledWith(
          '100',
          'Rod Red',
          HearingOutcomePlea.UNFIT,
          NotProceedReason.NOT_FAIR,
          'details',
          expect.anything()
        )
      )
  })
  it('should not call the createNotProceed endpoint (for referrals and not proceed without hearing)', () => {
    return request(app)
      .post(
        `${adjudicationUrls.reasonForNotProceeding.urls.completeHearingStart('100')}?adjudicator=Rod%20Red&plea=GUILTY`
      )
      .send({
        notProceedReason: NotProceedReason.NOT_FAIR,
        notProceedDetails: 'details',
      })
      .then(() => expect(outcomesService.createNotProceed).not.toHaveBeenCalled())
  })
})
