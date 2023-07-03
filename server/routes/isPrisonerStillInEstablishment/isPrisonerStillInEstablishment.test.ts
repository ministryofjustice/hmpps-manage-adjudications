import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, {})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET', () => {
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.isPrisonerStillInEstablishment.urls.start())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Is the prisoner still in this establishment')
      })
  })
})
describe('POST', () => {
  it('should redirect to the correct url', () => {
    return request(app)
      .post(adjudicationUrls.isPrisonerStillInEstablishment.urls.start())
      .send({ stillInEstablishment: 'true' })
      .expect('Location', adjudicationUrls.searchForPrisoner.root)
  })
  it('should redirect to the correct url', () => {
    return request(app)
      .post(adjudicationUrls.isPrisonerStillInEstablishment.urls.start())
      .send({ stillInEstablishment: 'false' })
      .expect('Location', `${adjudicationUrls.searchForPrisoner.root}?transfer=true`)
  })
})
