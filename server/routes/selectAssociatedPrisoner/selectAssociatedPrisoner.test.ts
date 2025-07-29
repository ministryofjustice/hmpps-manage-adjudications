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
  app = appWithAllRoutes(
    { production: false },
    { prisonerSearchService },
    { redirectUrl: adjudicationUrls.incidentDetails.urls.edit('G6123VU', 1234) },
  )
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /select-associated-prisoner', () => {
  describe('with results', () => {
    beforeEach(() => {
      const searchResult = testData.prisonerSearchSummary({
        firstName: 'John',
        lastName: 'Smith',
        prisonerNumber: 'A1234AA',
        startHref: adjudicationUrls.incidentDetails.urls.start('A1234AA'),
      })
      return prisonerSearchService.search.mockResolvedValue([searchResult])
    })

    it('should load the search for a prisoner page', () => {
      return request(app)
        .get(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=Smith`)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Select a prisoner')
          expect(res.text).toContain('Smith, John')
          expect(res.text).toContain(
            `<a href="${adjudicationUrls.incidentDetails.urls.edit(
              'G6123VU',
              1234,
            )}?selectedPerson=A1234AA" class="govuk-link" data-qa="select-prisoner-link">Select prisoner<span class="govuk-visually-hidden"> for John Smith</span></a>`,
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
        .get(`${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=Smith`)
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
      .post(adjudicationUrls.selectAssociatedPrisoner.root)
      .send({ searchTerm: 'Smith' })
      .expect(
        'Location',
        `${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=Smith&redirectUrl=%2Fincident-details%2FG6123VU%2F1234%2Fedit`,
      )
  })
  it('should redirect to select prisoner page with the correct search text and redirect URL intact - with query', () => {
    app = appWithAllRoutes(
      { production: false },
      { prisonerSearchService },
      {
        redirectUrl: `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6123VU',
          1234,
        )}?referrer=${adjudicationUrls.prisonerReport.urls.review('1524455')}`,
      },
    )
    return request(app)
      .post(adjudicationUrls.selectAssociatedPrisoner.root)
      .send({ searchTerm: 'Smith' })
      .expect(
        'Location',
        `${adjudicationUrls.selectAssociatedPrisoner.root}?searchTerm=Smith&redirectUrl=%2Fincident-details%2FG6123VU%2F1234%2Fsubmitted%2Fedit%3Freferrer%3D%2Fprisoner-report%2F1524455%2Freview`,
      )
  })

  it('should render validation messages', () => {
    return request(app)
      .post(adjudicationUrls.selectAssociatedPrisoner.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Select a prisoner')
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter a prisoner’s name or number')
      })
  })
})
