import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, locationService },
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

  placeOnReportService.startNewDraftAdjudication.mockResolvedValue({
    draftAdjudication: {
      id: 1,
      prisonerNumber: 'G6415GD',
      startedByUserId: 'TEST_GEN',
      incidentDetails: {
        locationId: 2,
        dateTimeOfIncident: '2021-10-27T13:30:00.000',
      },
      incidentRole: {
        associatedPrisonersNumber: 'G2678PF',
        roleCode: '25b',
      },
    },
  })
  placeOnReportService.getReporterName.mockResolvedValue('Test User')
  locationService.getIncidentLocations.mockResolvedValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-details', () => {
  it('should load the incident details page', () => {
    return request(app)
      .get(adjudicationUrls.incidentDetails.urls.start('G6415GD'))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident details')
      })
  })
})

describe('POST /incident-details', () => {
  it('should redirect to applicable rules page if details are complete', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentDetails.urls.start('G6415GD')}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'incited',
        incitedInput: 'G2678PF',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.ageOfPrisoner.urls.start(1))
  })
  it('should render an error summary with correct validation message - incorrect time entered', () => {
    return request(app)
      .post(`${adjudicationUrls.incidentDetails.urls.start('G6415GD')}?selectedPerson=G2678PF`)
      .send({ incidentDate: { date: '27/10/2021', time: { hour: '66', minute: '30' } }, locationId: 2 })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter an hour between 00 and 23')
      })
  })
  it('should throw an error on api failure', () => {
    placeOnReportService.startNewDraftAdjudication.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(`${adjudicationUrls.incidentDetails.urls.start('G6415GD')}?selectedPerson=G2678PF`)
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '12', minute: '30' } },
        locationId: 2,
        currentRadioSelected: 'incited',
        incitedInput: 'G2678PF',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
})
