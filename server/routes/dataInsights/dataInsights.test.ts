import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import config from '../../config'

let app: Express
const defaultConfig = config

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, {})
})

afterEach(() => {
  jest.resetAllMocks()
  config.dataInsightsFlag = 'false'
})

describe('GET /data-insights', () => {
  defaultConfig.dataInsightsFlag = 'true'
  it('should load the adjudication data', () => {
    return request(app)
      .get(adjudicationUrls.dataInsights.urls.start())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudication data')
      })
  })
})
