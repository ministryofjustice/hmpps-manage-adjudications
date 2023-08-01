import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerSearchService from '../../services/prisonerSearchService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/prisonerSearchService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null) as jest.Mocked<PlaceOnReportService>
const prisonerSearchService = new PrisonerSearchService(null) as jest.Mocked<PrisonerSearchService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, prisonerSearchService },
    { originalRadioSelection: 'incited' }
  )
  placeOnReportService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'Udfsanaye',
      lastName: 'Aidetria',
    })
  )

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 100,
      prisonerNumber: 'G6415GD',
    }),
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /associated-prisoner', () => {
  it('should load the incident associate page', () => {
    return request(app)
      .get(adjudicationUrls.incidentAssociate.urls.start(100, 'assisted'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Who did Udfsanaye Aidetria assist?')
      })
  })
})

describe('POST /associated-prisoner', () => {
  it('should redirect to type of offence page if associated prisoner completed - internal', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentAssociate.urls.start(100, 'assisted')}?selectedPerson=G2678PF`)
      .send({
        selectedAnswerId: 'internal',
        prisonerId: '1234',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.offenceCodeSelection.urls.start(100, 'assisted'))
  })
  it('should redirect to type of offence page if associated prisoner completed - external', () => {
    prisonerSearchService.isPrisonerNumberValid.mockResolvedValue(true)

    return request(app)
      .post(`${adjudicationUrls.incidentAssociate.urls.start(100, 'assisted')}?selectedPerson=G2678PF`)
      .send({
        selectedAnswerId: 'external',
        prisonerId: '1234',
        prisonerOutsideEstablishmentNameInput: 'test',
        prisonerOutsideEstablishmentNumberInput: '1234',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.offenceCodeSelection.urls.start(100, 'assisted'))
  })
  it('should render an error summary with correct validation message - missing radio button selection', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentAssociate.urls.start(100, 'assisted')}?selectedPerson=G2678PF`)
      .send({})
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select an option')
      })
  })
})
