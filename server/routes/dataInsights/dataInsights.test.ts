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

describe('GET /data-insights', () => {
  it('should load the adjudication data', () => {
    return request(app)
      .get(adjudicationUrls.dataInsights.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudication data')
      })
  })
})
