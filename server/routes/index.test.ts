import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render homepage page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('This site is under construction...')
      })
  })
})
