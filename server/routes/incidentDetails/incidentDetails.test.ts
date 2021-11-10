import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService, locationService })
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    assignedLivingUnit: {
      agencyId: 'MDI',
      locationId: 25928,
      description: '4-2-001',
      agencyName: 'Moorland (HMP & YOI)',
    },
    categoryCode: undefined,
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })

  placeOnReportService.startNewDraftAdjudication.mockResolvedValue({
    draftAdjudication: {
      id: 1,
      prisonerNumber: 'G6415GD',
      createdByUserId: 'TEST_GEN',
      createdDateTime: '2021-11-04T09:21:21.95935',
      incidentDetails: {
        locationId: 2,
        dateTimeOfIncident: '2021-10-27T13:30:00.000',
      },
    },
  })

  locationService.getIncidentLocations.mockResolvedValue([])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-details', () => {
  it('should load the incident details page', () => {
    return request(app)
      .get('/incident-details/G6415GD')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident details')
      })
  })
})

describe('POST /incident-details', () => {
  it('should redirect to incident statement page if details is complete', () => {
    return request(app)
      .post('/incident-details/G6415GD')
      .send({ incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } }, locationId: '2' })
      .expect(302)
      .expect('Location', '/incident-statement/G6415GD/1')
  })
  it('should render an error summary with correct validation message', () => {
    return request(app)
      .post('/incident-details/G6415GD')
      .send({ incidentDate: { date: '27/10/2021', time: { hour: '66', minute: '30' } }, locationId: '2' })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter an hour which is 23 or less')
      })
  })
  it('should throw an error on api failure', () => {
    placeOnReportService.startNewDraftAdjudication.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post('/incident-details/G6415GD')
      .send({ incidentDate: { date: '27/10/2021', time: { hour: '12', minute: '30' } }, locationId: '2' })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
})
