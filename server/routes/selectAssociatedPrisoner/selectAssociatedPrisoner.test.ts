import { Express } from 'express'
import request from 'supertest'
import PrisonerSearchService, { PrisonerSearchSummary } from '../../services/prisonerSearchService'
import { prisonerReport } from '../../utils/urlGenerator'
import appWithAllRoutes from '../testutils/appSetup'

jest.mock('../../services/prisonerSearchService')

const prisonerSearchService = new PrisonerSearchService(null) as jest.Mocked<PrisonerSearchService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { prisonerSearchService },
    { redirectUrl: '/incident-details/G6123VU/1234' }
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-associated-prisoner', () => {
  describe('with results', () => {
    beforeEach(() => {
      prisonerSearchService.search.mockResolvedValue([
        {
          cellLocation: '1-2-015',
          displayCellLocation: '1-2-015',
          displayName: 'Smith, John',
          friendlyName: 'John Smith',
          prisonerNumber: 'A1234AA',
          prisonName: 'HMP Moorland',
        } as PrisonerSearchSummary,
      ])
    })

    it('should load the search for a prisoner page', () => {
      return request(app)
        .get('/select-associated-prisoner?searchTerm=Smith')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select a prisoner')
          expect(res.text).toContain('Smith, John')
          expect(res.text).toContain(
            '<a href="/incident-details/G6123VU/1234?selectedPerson=A1234AA" class="govuk-link" data-qa="select-prisoner-link">Select prisoner<span class="govuk-visually-hidden"> for John Smith</span></a>'
          )
        })
    })
  })

  describe('without results', () => {
    beforeEach(() => {
      prisonerSearchService.search.mockResolvedValue([])
    })

    it('should load the search for a prisoner page', () => {
      return request(app)
        .get('/select-associated-prisoner?searchTerm=Smith')
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select a prisoner')
          expect(res.text).toContain('There are no results for the details you have entered.')
        })
    })
  })
})

describe('POST /select-associated-prisoner', () => {
  it('should redirect to select prisoner page with the correct search text and redirect URL intact', () => {
    return request(app)
      .post('/select-associated-prisoner')
      .send({ searchTerm: 'Smith' })
      .expect(
        'Location',
        '/select-associated-prisoner?searchTerm=Smith&redirectUrl=%2Fincident-details%2FG6123VU%2F1234'
      )
  })
  it('should redirect to select prisoner page with the correct search text and redirect URL intact - with query', () => {
    app = appWithAllRoutes(
      { production: false },
      { prisonerSearchService },
      { redirectUrl: `/incident-details/G6123VU/1234/submitted/edit?referrer=${prisonerReport.urls.review(1524455)}` }
    )
    return request(app)
      .post('/select-associated-prisoner')
      .send({ searchTerm: 'Smith' })
      .expect(
        'Location',
        '/select-associated-prisoner?searchTerm=Smith&redirectUrl=%2Fincident-details%2FG6123VU%2F1234%2Fsubmitted%2Fedit%3Freferrer%3D%2Fprisoner-report%2F1524455%2Freview'
      )
  })

  it('should render validation messages', () => {
    return request(app)
      .post('/select-associated-prisoner')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Select a prisoner')
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter a prisoner’s name or number')
      })
  })
})
