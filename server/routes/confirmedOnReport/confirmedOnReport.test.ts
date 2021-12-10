import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/locationService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

const locationService = new LocationService(null) as jest.Mocked<LocationService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, locationService })
})

const reportedAdjudicationInformation = {
  reportExpirationDateTime: '2020-12-23T07:21',
  prisonerFirstName: 'John',
  prisonerLastName: 'Smith',
  prisonerNumber: 'H5123BY',
  prisonerPreferredNonEnglishLanguage: 'French',
  prisonerOtherLanguages: ['English', 'Spanish'],
  prisonerNeurodiversities: ['Moderate learning difficulty', 'Dyslexia'],
  statement: 'A statement',
}

const location = {
  locationId: 27187,
  locationType: 'ADJU',
  description: 'ADJ',
  agencyId: 'MDI',
  parentLocationId: 27186,
  currentOccupancy: 0,
  locationPrefix: 'MDI-RES-MCASU-MCASU',
  userDescription: 'Adj',
  internalLocationCode: 'MCASU',
}

const agency = {
  agencyId: 'MDI',
  description: 'Moorland (HMP & YOI)',
}
// TODO qqRP rationalise test
reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue(reportedAdjudicationInformation)
locationService.getIncidentLocation.mockResolvedValue(location)
locationService.getAgency.mockResolvedValue(agency)

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /prisoner-placed-on-report', () => {
  it('should load the confirmation of placed on report page', () => {
    return request(app)
      .get('/prisoner-placed-on-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('John Smith has been placed on report')
        expect(res.text).toContain('123')
        expect(res.text).toContain('John Smith’s preferred language is')
        expect(res.text).toContain('They have other languages of')
        expect(res.text).toContain('They have recorded disabilities')
        expect(res.text).toContain('Moderate learning difficulty')
        expect(res.text).toContain('Dyslexia')
      })
  })

  it('should not show neurodivesity information if none provided', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue({
      ...reportedAdjudicationInformation,
      prisonerNeurodiversities: null,
    })
    locationService.getIncidentLocation.mockResolvedValue(location)
    locationService.getAgency.mockResolvedValue(agency)
    return request(app)
      .get('/prisoner-placed-on-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).not.toContain('They have recorded disabilities')
      })
  })

  it('should not show any language information if no primary language provided', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue({
      ...reportedAdjudicationInformation,
      prisonerPreferredNonEnglishLanguage: null,
    })
    locationService.getIncidentLocation.mockResolvedValue(location)
    locationService.getAgency.mockResolvedValue(agency)
    return request(app)
      .get('/prisoner-placed-on-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).not.toContain('John Smith’s preferred language is')
        expect(res.text).not.toContain('They have other languages of')
      })
  })

  it('should not show the secondary language text if no secondary languages provided', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockResolvedValue({
      ...reportedAdjudicationInformation,
      prisonerOtherLanguages: null,
    })
    locationService.getIncidentLocation.mockResolvedValue(location)
    locationService.getAgency.mockResolvedValue(agency)
    return request(app)
      .get('/prisoner-placed-on-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('John Smith’s preferred language is')
        expect(res.text).not.toContain('They have other languages of')
      })
  })

  it('should throw an error if no adjudication number provided', () => {
    return request(app)
      .get('/prisoner-placed-on-report')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('NotFoundError')
      })
  })

  it('should throw an error if an invalid adjudication number provided', () => {
    return request(app)
      .get('/prisoner-placed-on-report/BadNumber')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: No adjudication number provided')
      })
  })

  it('should throw an error on api failure', () => {
    reportedAdjudicationsService.getReportedAdjudication.mockRejectedValue(new Error('error message content'))
    return request(app)
      .get('/prisoner-placed-on-report/123')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})
