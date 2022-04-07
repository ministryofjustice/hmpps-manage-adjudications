import { Express } from 'express'
import request from 'supertest'
import { selectPrisoner } from '../../utils/urlGenerator'
import appWithAllRoutes from '../testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /search-for-prisoner', () => {
  it('should load the search for a prisoner page', () => {
    return request(app)
      .get('/search-for-prisoner')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Search for a prisoner to start a new report')
      })
  })
})

describe('POST /search-for-prisoner', () => {
  it('should redirect to select prisoner page with the correct search text', () => {
    return request(app)
      .post('/search-for-prisoner')
      .send({ searchTerm: 'Smith' })
      .expect('Location', `${selectPrisoner.root}?searchTerm=Smith`)
  })

  it('should render validation messages', () => {
    return request(app)
      .post('/search-for-prisoner')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Search for a prisoner')
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter a prisoner’s name or number')
      })
  })
})
