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

describe('GET /offence-details', () => {
  it('should load the type of offence page', () => {
    return request(app)
      .get('/offence-details/G6415GD/3456')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Type of offence')
        expect(res.text).toContain('Go to offence details page')
        expect(res.text).toContain(
          '<a href="/details-of-offence/G6415GD/3456" class="govuk-link">Go to offence details page</a>'
        )
      })
  })
})
