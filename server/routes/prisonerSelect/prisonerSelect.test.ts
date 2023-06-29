import { Express } from 'express'
import request from 'supertest'
import PrisonerSearchService from '../../services/prisonerSearchService'
import adjudicationUrls from '../../utils/urlGenerator'
import appWithAllRoutes from '../testutils/appSetup'
import TestData from '../testutils/testData'

jest.mock('../../services/prisonerSearchService')

const prisonerSearchService = new PrisonerSearchService(null) as jest.Mocked<PrisonerSearchService>

let app: Express

const testData = new TestData()

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { prisonerSearchService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-prisoner', () => {
  describe('with results', () => {
    beforeEach(() => {
      const searchResult = testData.prisonerSearchSummary({
        firstName: 'John',
        lastName: 'Smith',
        prisonerNumber: 'A1234AA',
        prisonId: 'LEI',
        startHref: adjudicationUrls.incidentDetails.urls.start('A1234AA'),
      })
      return prisonerSearchService.search.mockResolvedValue([searchResult])
    })

    it('should load the search for a prisoner page', () => {
      return request(app)
        .get(`${adjudicationUrls.selectPrisoner.root}?searchTerm=Smith`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select a prisoner')
          expect(res.text).toContain('<p class="align-right"><strong>Prisoners listed:</strong> 1</p>')
          expect(res.text).toContain(
            '<img src="/prisoner/A1234AA/image" alt="Photograph of Smith, John" class="results-table__image" />'
          )
          expect(res.text).toContain('Smith, John')
          expect(res.text).toContain('1-2-015')
          expect(res.text).toContain(
            `<a href="${adjudicationUrls.incidentDetails.urls.start(
              'A1234AA'
            )}" class="govuk-link" data-qa="start-report-link">Start a report<span class="govuk-visually-hidden">for John Smith</span></a>`
          )
        })
    })

    it('should load the search for a prisoner page for a transfer', () => {
      return request(app)
        .get(`${adjudicationUrls.selectPrisoner.root}?searchTerm=Smith&transfer=true`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select a prisoner')
          expect(res.text).toContain('<p class="align-right"><strong>Prisoners listed:</strong> 1</p>')
          expect(res.text).toContain(
            '<img src="/prisoner/A1234AA/image" alt="Photograph of Smith, John" class="results-table__image" />'
          )
          expect(res.text).toContain('Smith, John')
          expect(res.text).toContain('1-2-015')
          expect(res.text).toContain(
            `<a href="${adjudicationUrls.incidentDetails.urls.start(
              'A1234AA'
            )}" class="govuk-link" data-qa="start-report-link">Start a report<span class="govuk-visually-hidden">for John Smith</span></a>`
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
        .get(`${adjudicationUrls.selectPrisoner.root}?searchTerm=Smith`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select a prisoner')
          expect(res.text).toContain('There are no results for the details you have entered.')
        })
    })
  })
})

describe('POST /select-prisoner', () => {
  it('should redirect to select prisoner page with the correct search text', () => {
    return request(app)
      .post(adjudicationUrls.selectPrisoner.root)
      .send({ searchTerm: 'Smith' })
      .expect('Location', `${adjudicationUrls.selectPrisoner.root}?searchTerm=Smith&transfer=`)
  })

  it('should render validation messages', () => {
    return request(app)
      .post(adjudicationUrls.selectPrisoner.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Select a prisoner')
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter a prisoner’s name or number')
      })
  })
})
