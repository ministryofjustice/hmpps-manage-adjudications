import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

import { OutcomeCode, QuashGuiltyFindingReason } from '../../../data/HearingAndOutcomeResult'
import TestData from '../../testutils/testData'

jest.mock('../../../services/userService')
jest.mock('../../../services/outcomesService')
jest.mock('../../../services/reportedAdjudicationsService')

const testData = new TestData()
const userService = new UserService(null, null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService() as jest.Mocked<OutcomesService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null,
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { outcomesService, userService, reportedAdjudicationsService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getLastOutcomeItem.mockResolvedValue({
    outcome: {
      outcome: testData.outcome({
        code: OutcomeCode.QUASHED,
        details: 'abc',
        quashedReason: QuashGuiltyFindingReason.FLAWED_CASE,
      }),
    },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { outcomesService, userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the quash page', () => {
    return request(app)
      .get(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Report a quashed guilty finding')
      })
  })
})

describe('POST', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(adjudicationUrls.reportAQuashedGuiltyFinding.urls.edit('100'))
      .send({
        quashReason: QuashGuiltyFindingReason.APPEAL_UPHELD,
        quashDetails: 'Some details about this decision',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review('100'))
      .then(() => expect(outcomesService.quashAGuiltyFinding).not.toHaveBeenCalled())
      .then(() =>
        expect(outcomesService.editQuashedOutcome).toHaveBeenCalledWith(
          '100',
          QuashGuiltyFindingReason.APPEAL_UPHELD,
          'Some details about this decision',
          expect.anything(),
        ),
      )
  })
})
