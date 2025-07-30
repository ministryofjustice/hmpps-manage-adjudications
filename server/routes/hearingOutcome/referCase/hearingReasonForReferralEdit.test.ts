import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import { HearingOutcomeCode, ReferGovReason } from '../../../data/HearingAndOutcomeResult'
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
  null,
  null,
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { hearingsService, userService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue({
    hearing: testData.singleHearing({
      dateTimeOfHearing: '2023-03-14T18:00:00',
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.REFER_POLICE,
        optionalItems: { details: 'A reason for referral' },
      }),
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /reason-for-referral', () => {
  it('should load the `Reason for referral` page', () => {
    return request(app)
      .get(adjudicationUrls.hearingReasonForReferral.urls.edit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the reason for the referral?')
      })
  })
})

describe('POST /reason-for-referral', () => {
  it('should redirect to the confirmation page if query params present', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          '100',
        )}?adjudicator=Roxanne%20Red&hearingOutcome=REFER_POLICE`,
      )
      .send({
        referralReason: '123',
        hearingOutcomeCode: HearingOutcomeCode.REFER_POLICE,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingReferralConfirmation.urls.start('100'))
  })
  it('should successfully call the endpoint and redirect to the confirmation page if query params present', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          '100',
        )}?adjudicator=Roxanne%20Red&hearingOutcome=REFER_POLICE`,
      )
      .send({
        referralReason: '123',
        hearingOutcomeCode: HearingOutcomeCode.REFER_POLICE,
      })
      .then(() =>
        expect(hearingsService.editReferralHearingOutcome).toHaveBeenCalledWith(
          '100',
          HearingOutcomeCode.REFER_POLICE,
          '123',
          expect.anything(),
          'Roxanne Red',
          undefined,
        ),
      )
  })
  it('should successfully call the endpoint with the referGovReason if present', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          '100',
        )}?adjudicator=Roxanne%20Red&hearingOutcome=REFER_GOV`,
      )
      .send({
        referralReason: '123',
        hearingOutcomeCode: HearingOutcomeCode.REFER_GOV,
        referGovReason: ReferGovReason.GOV_INQUIRY,
      })
      .then(() =>
        expect(hearingsService.editReferralHearingOutcome).toHaveBeenCalledWith(
          '100',
          HearingOutcomeCode.REFER_GOV,
          '123',
          expect.anything(),
          'Roxanne Red',
          ReferGovReason.GOV_INQUIRY,
        ),
      )
  })
  it('should successfully call the endpoint and redirect to the confirmation page if query params are not present', () => {
    return request(app)
      .post(adjudicationUrls.hearingReasonForReferral.urls.edit('100'))
      .send({
        referralReason: '123',
        hearingOutcomeCode: HearingOutcomeCode.REFER_INAD,
      })
      .then(() =>
        expect(hearingsService.editReferralHearingOutcome).toHaveBeenCalledWith(
          '100',
          HearingOutcomeCode.REFER_INAD,
          '123',
          expect.anything(),
          undefined,
          undefined,
        ),
      )
  })
  it('should use the query parameter outcome code rather than api outcome code if one is present', () => {
    return request(app)
      .post(
        `${adjudicationUrls.hearingReasonForReferral.urls.edit(
          '100',
        )}?adjudicator=Roxanne%20Red&hearingOutcome=REFER_INAD`,
      )
      .send({
        referralReason: '123',
        hearingOutcomeCode: HearingOutcomeCode.REFER_POLICE,
      })
      .then(() =>
        expect(hearingsService.editReferralHearingOutcome).toHaveBeenCalledWith(
          '100',
          HearingOutcomeCode.REFER_INAD,
          '123',
          expect.anything(),
          'Roxanne Red',
          undefined,
        ),
      )
  })
})
