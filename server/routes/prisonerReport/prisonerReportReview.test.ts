import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')
jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/userService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>
const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { reportedAdjudicationsService, placeOnReportService, locationService, userService }
  )
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'John',
    lastName: 'Smith',
    assignedLivingUnit: {
      agencyId: 'MDI',
      locationId: 25928,
      description: '4-2-001',
      agencyName: 'Moorland (HMP & YOI)',
    },
    categoryCode: undefined,
    language: 'English',
    friendlyName: 'John Smith',
    displayName: 'Smith, John',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
  })

  locationService.getIncidentLocations.mockResolvedValue([
    { locationId: 5, locationPrefix: 'PC', userDescription: "Prisoner's cell" },
    { locationId: 6, locationPrefix: 'OC', userDescription: 'Rivendell' },
    { locationId: 2, locationPrefix: 'P2', userDescription: 'Hogwarts' },
    { locationId: 4, locationPrefix: 'P4', userDescription: 'Arundel' },
    { locationId: 1, locationPrefix: 'P1', userDescription: 'Timbuktu' },
    { locationId: 3, locationPrefix: 'P3', userDescription: 'Narnia' },
  ])

  reportedAdjudicationsService.getPrisonerReport.mockResolvedValue({
    reportNo: 12345,
    draftId: 234,
    incidentDetails: [
      {
        label: 'Reporting Officer',
        value: 'T. User',
      },
      {
        label: 'Date',
        value: '8 March 2020',
      },
      {
        label: 'Time',
        value: '10:45',
      },
      {
        label: 'Location',
        value: 'Chapel',
      },
    ],
    statement: 'STATEMENT HERE',
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner-report', () => {
  it('should load the prisoner report page if the user has the correct role', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    return request(app)
      .get('/prisoner-report/G6415GD/12345/review')
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('John Smith’s report')
        expect(response.text).toContain('10:45')
        expect(response.text).toContain('Chapel')
        expect(reportedAdjudicationsService.getPrisonerReport).toHaveBeenCalledTimes(1)
      })
  })
  it('should not load the prisoner report page if no role present', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .get('/prisoner-report/G6415GD/12345/review')
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Page not found')
        expect(reportedAdjudicationsService.getPrisonerReport).toHaveBeenCalledTimes(0)
      })
  })
})
