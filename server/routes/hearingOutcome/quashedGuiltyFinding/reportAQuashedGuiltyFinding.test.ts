import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'
import { QuashGuiltyFindingReason } from '../../../data/HearingAndOutcomeResult'

jest.mock('../../../services/userService')
jest.mock('../../../services/outcomesService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService() as jest.Mocked<OutcomesService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { outcomesService, userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
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
      .get(adjudicationUrls.reportAQuashedGuiltyFinding.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET', () => {
  it('should load the quash page', () => {
    return request(app)
      .get(adjudicationUrls.reportAQuashedGuiltyFinding.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Report a quashed guilty finding')
      })
  })
})

describe('POST', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(adjudicationUrls.reportAQuashedGuiltyFinding.urls.start('100'))
      .send({
        quashReason: QuashGuiltyFindingReason.APPEAL_UPHELD,
        quashDetails: 'Some details about this decision',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review('100'))
      .then(() =>
        expect(outcomesService.quashAGuiltyFinding).toHaveBeenCalledWith(
          '100',
          QuashGuiltyFindingReason.APPEAL_UPHELD,
          'Some details about this decision',
          expect.anything(),
        ),
      )
  })
})
