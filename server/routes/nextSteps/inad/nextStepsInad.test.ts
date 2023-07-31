import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'

jest.mock('../../../services/userService')

const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { userService }, {})
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /nextSteps/inad', () => {
  beforeEach(() => {
    app = appWithAllRoutes({ production: false }, { userService }, {})
    userService.getUserRoles.mockResolvedValue(['NOT_REVIEWER'])
  })
  it('should load the `Page not found` page', () => {
    return request(app)
      .get(adjudicationUrls.nextStepsInad.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('GET /nextSteps/inad', () => {
  it('should load the `Prosecution` page', () => {
    return request(app)
      .get(adjudicationUrls.nextStepsInad.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('What is the next step?')
      })
  })
})

describe('POST /nextSteps/inad', () => {
  it('should successfully redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.nextStepsInad.urls.start('100')}`)
      .send({
        nextStepChosen: 'schedule_hearing',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.scheduleHearing.urls.start('100'))
  })
  it('should successfully redirect', () => {
    return request(app)
      .post(`${adjudicationUrls.nextStepsInad.urls.start('100')}`)
      .send({
        nextStepChosen: 'not_proceed',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.reasonForNotProceeding.urls.start('100'))
  })
})
