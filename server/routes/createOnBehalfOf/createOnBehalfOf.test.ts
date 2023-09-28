import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

jest.mock('./createOnBehalfOfSessionService.ts')

const createOnBehalfOfSessionService =
  new CreateOnBehalfOfSessionService() as jest.Mocked<CreateOnBehalfOfSessionService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { createOnBehalfOfSessionService })
  createOnBehalfOfSessionService.getRedirectUrl.mockReturnValueOnce(adjudicationUrls.checkYourAnswers.urls.start(100))
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /create-on-behalf-of', () => {
  it('should load the check page', () => {
    return request(app)
      .get(adjudicationUrls.createOnBehalfOf.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Enter the new reporting officer’s name')
        expect(res.text).toContain('Return to report 100')
      })
  })
})

describe('POST /create-on-behalf-of', () => {
  it('should redirect to the reason page when the form is submitted', () => {
    return request(app)
      .post(adjudicationUrls.createOnBehalfOf.urls.start('100'))
      .send({ createdOnBehalfOfOfficer: 'some officer' })
      .expect(
        'Location',
        `${adjudicationUrls.createOnBehalfOf.urls.reason(100)}?createdOnBehalfOfOfficer=some%20officer`
      )
  })

  it('should render error summary with correct validation message', () => {
    return request(app)
      .post(adjudicationUrls.createOnBehalfOf.urls.start('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter the new reporting officer’s name')
      })
  })
})
