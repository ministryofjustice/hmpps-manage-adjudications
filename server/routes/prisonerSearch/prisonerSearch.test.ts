import { Express } from 'express'
import request from 'supertest'
import adjudicationUrls from '../../utils/urlGenerator'
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
      .get(adjudicationUrls.searchForPrisoner.root)
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Search for a prisoner to start a new report')
      })
  })
})

describe('POST /search-for-prisoner', () => {
  it('should redirect to select prisoner page with the correct search text and transfer', () => {
    return request(app)
      .post(`${adjudicationUrls.searchForPrisoner.root}?transfer=true`)
      .send({ searchTerm: 'Smith' })
      .expect('Location', `${adjudicationUrls.selectPrisoner.root}?searchTerm=Smith&transfer=true`)
  })

  it('should redirect to select prisoner page with the correct search text', () => {
    return request(app)
      .post(adjudicationUrls.searchForPrisoner.root)
      .send({ searchTerm: 'Smith' })
      .expect('Location', `${adjudicationUrls.selectPrisoner.root}?searchTerm=Smith`)
  })

  it('should render validation messages', () => {
    return request(app)
      .post(adjudicationUrls.searchForPrisoner.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Search for a prisoner')
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter a prisoner’s name or number')
      })
  })
})
