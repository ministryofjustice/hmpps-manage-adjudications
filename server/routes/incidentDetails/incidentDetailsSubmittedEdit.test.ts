import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService, locationService })
  placeOnReportService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'Udfsanaye',
      lastName: 'Aidetria',
    })
  )

  placeOnReportService.getDraftIncidentDetailsForEditing.mockResolvedValue({
    dateTime: { date: '08/11/2021', time: { hour: '10', minute: '00' } },
    locationId: 1234,
    startedByUserId: 'TESTER2_GEN',
    chargeNumber: '1524493',
    dateTimeOfDiscovery: { date: '08/11/2021', time: { hour: '10', minute: '00' } },
  })

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: testData.draftAdjudication({
      id: 34,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-10-27T13:30:17.808Z',
    }),
  })

  placeOnReportService.getReporterName.mockResolvedValue('Tester2 User')

  placeOnReportService.getNextOffencesUrl.mockResolvedValue(adjudicationUrls.ageOfPrisoner.urls.start(34) as never)

  locationService.getIncidentLocations.mockResolvedValue(testData.residentialLocations())
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-details/<PRN>/<id>/submitted/edit', () => {
  it('should load the incident details edit page with report referrer', () => {
    return request(app)
      .get(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          5
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident details')
        expect(res.text).toContain('Tester2 User')
      })
  })
  it('should load the incident details edit page with review referrer', () => {
    return request(app)
      .get(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          5
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident details')
        expect(res.text).toContain('Tester2 User')
      })
  })
  it('should load the incident details edit page with no referrer', () => {
    return request(app)
      .get(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 5))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident details')
        expect(res.text).toContain('Tester2 User')
      })
  })
  it('should throw an error on api failure', () => {
    placeOnReportService.getDraftIncidentDetailsForEditing.mockRejectedValue(new Error('error message content'))
    return request(app)
      .get(adjudicationUrls.incidentDetails.urls.submittedEdit('G6415GD', 34))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: error message content')
      })
  })
})

describe('POST /incident-details/<PRN>/<id>/submitted/edit', () => {
  it('should redirect to applicable rule page if there are no offence details on the report', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          34
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        discoveryDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        discoveryRadioSelected: 'Yes',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.ageOfPrisoner.urls.start(34))
  })
  it('should redirect to offence details page if there are offence details on the report', () => {
    placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
      draftAdjudication: testData.draftAdjudication({
        id: 34,
        chargeNumber: '1524493',
        prisonerNumber: 'G6415GD',
        dateTimeOfIncident: '2021-10-27T13:30:17.808Z',
      }),
    })
    placeOnReportService.getNextOffencesUrl.mockResolvedValue(adjudicationUrls.detailsOfOffence.urls.start(34) as never)
    return request(app)
      .post(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          34
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        discoveryDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        discoveryRadioSelected: 'Yes',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfOffence.urls.start(34))
  })
  it('should render an error summary with correct validation message', () => {
    return request(app)
      .post(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          34
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '66', minute: '30' } },
        locationId: 2,
        discoveryRadioSelected: 'Yes',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Enter an hour between 00 and 23')
      })
  })
  it('should throw an error on PUT endpoint failure', () => {
    placeOnReportService.editDraftIncidentDetails.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(
        `${adjudicationUrls.incidentDetails.urls.submittedEdit(
          'G6415GD',
          34
        )}?referrer=${adjudicationUrls.prisonerReport.urls.report(1524455)}`
      )
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        discoveryDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        discoveryRadioSelected: 'Yes',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
})
