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

describe('GET /incident-statment', () => {
  it('should load the incident statement page', () => {
    return request(app)
      .get('/incident-statement')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident statement')
      })
  })
})

describe('POST /incident-statment', () => {
  it('should redirect to check your answers page if statement is complete', () => {
    return request(app)
      .post('/incident-statement')
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'yes' })
      .expect('Location', '/check-your-answers')
  })

  it('should redirect to the landing page if the statement is incomplete', () => {
    return request(app)
      .post('/incident-statement')
      .send({ incidentStatement: 'Lorem Ipsum', incidentStatementComplete: 'no' })
      .expect('Location', '/place-a-prisoner-on-report')
  })

  it('should render validation messages', () => {
    return request(app)
      .post('/incident-statement')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select yes if you have completed your statement')
      })
  })
})
