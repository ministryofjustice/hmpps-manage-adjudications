import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerSearchService from '../../services/prisonerSearchService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/prisonerSearchService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const prisonerSearchService = new PrisonerSearchService(null) as jest.Mocked<PrisonerSearchService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, prisonerSearchService },
    { originalRadioSelection: 'incited' }
  )
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    dateOfBirth: undefined,
    assignedLivingUnit: {
      agencyId: 'MDI',
      locationId: 25928,
      description: '4-2-001',
      agencyName: 'Moorland (HMP & YOI)',
    },
    categoryCode: undefined,
    language: 'English',
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 100,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 27022,
        dateTimeOfIncident: '2022-03-23T09:10:00',
        handoverDeadline: '2022-03-25T09:10:00',
      },
      incidentRole: {},
      offenceDetails: [],
      incidentStatement: {
        statement: 'Lorem Ipsum',
        completed: true,
      },
      startedByUserId: 'TEST2_GEN',
    },
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
