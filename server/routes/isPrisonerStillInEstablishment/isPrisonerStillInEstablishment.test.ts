import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import config from '../../config'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, {})
})

afterEach(() => {
  jest.resetAllMocks()
  config.transfersFeatureFlag = 'false'
})

describe('GET', () => {
  config.transfersFeatureFlag = 'true'
  it('should load the page', () => {
    return request(app)
      .get(adjudicationUrls.isPrisonerStillInEstablishment.urls.start())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Is the prisoner still in this establishment')
      })
  })
})
