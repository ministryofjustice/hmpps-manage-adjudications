import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import OutcomesService from '../../../services/outcomesService'

jest.mock('../../../services/userService')
jest.mock('../../../services/outcomesService')

const userService = new UserService(null, null) as jest.Mocked<UserService>
const outcomesService = new OutcomesService(null) as jest.Mocked<OutcomesService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService, outcomesService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /nextSteps/police', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService, outcomesService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.nextStepsPolice.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /nextSteps/police', () => {
  it('should load the `Prosecution` page', () => {
    return request(app)
      .get(adjudicationUrls.nextStepsPolice.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Will this charge continue to prosecution?')
      })
  })
})

describe('POST /nextSteps/police', () => {
  it('should successfully call the endpoint and redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.nextStepsPolice.urls.start('100')}`)
      .send({
        prosecutionChosen: 'yes',
        nextStepChosen: null,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review('100'))
      .then(() => expect(outcomesService.createProsecution).toHaveBeenCalledWith('100', expect.anything()))
  })
})
