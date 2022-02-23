import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /details-of-offence', () => {
  it.skip('should load the type of offence page', () => {
    return request(app)
      .get('/details-of-offence/G6415GD/3456')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Offence details')
        expect(res.text).toContain(
          '<a href="/incident-statement/G6415GD/3456" class="govuk-link">Go to incident statement page</a>'
        )
      })
  })
})
