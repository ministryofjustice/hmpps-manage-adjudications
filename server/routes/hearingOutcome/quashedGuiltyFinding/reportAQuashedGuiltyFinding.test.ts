import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'

jest.mock('../../../services/userService')
jest.mock('../../../services/outcomesService')

const userService = new UserService(null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService(null) as jest.Mocked<OutcomesService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { outcomesService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /hearing-adjourned', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { outcomesService, userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.reportAQuashedGuiltyFinding.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /hearing-adjourned', () => {
  it('should load the quash page', () => {
    return request(app)
      .get(adjudicationUrls.reportAQuashedGuiltyFinding.urls.start(100))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Report a quashed guilty finding')
      })
  })
})

// describe('POST /hearing-adjourned', () => {
//   it('should successfully call the endpoint and redirect', () => {
//     return request(app)
//       .post(`${adjudicationUrls.hearingAdjourned.urls.start(100)}?adjudicator=Roxanne%20Red&hearingOutcome=ADJOURN`)
//       .send({
//         adjournReason: HearingOutcomeAdjournReason.EVIDENCE,
//         adjournDetails: '123',
//         adjournPlea: HearingOutcomePlea.NOT_ASKED,
//       })
//       .expect(302)
//       .expect('Location', adjudicationUrls.hearingDetails.urls.review(100))
//       .then(() =>
//         expect(hearingsService.createAdjourn).toHaveBeenCalledWith(
//           100,
//           HearingOutcomeCode.ADJOURN,
//           'Roxanne Red',
//           '123',
//           HearingOutcomeAdjournReason.EVIDENCE,
//           HearingOutcomePlea.NOT_ASKED,
//           expect.anything()
//         )
//       )
//   })
// })
