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

describe('GET /create-on-behalf-of/reason', () => {
  it('should load the check page', () => {
    return request(app)
      .get(`${adjudicationUrls.createOnBehalfOf.urls.reason('100')}?createdOnBehalfOfOfficer=some%20officer`)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Why are you creating this report for some officer?')
        expect(res.text).toContain('Return to report 100')
      })
  })
})

describe('POST /create-on-behalf-of/reason', () => {
  it('should redirect to the check page when the form is submitted', () => {
    return request(app)
      .post(adjudicationUrls.createOnBehalfOf.urls.reason('100'))
      .send({ createdOnBehalfOfReason: 'some reason' })
      .expect('Location', `${adjudicationUrls.createOnBehalfOf.urls.check('100')}`)
  })

  it('should render error summary with correct validation message', () => {
    return request(app)
      .post(adjudicationUrls.createOnBehalfOf.urls.reason('100'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter the reason why you are reporting this on their behalf')
      })
  })
})
