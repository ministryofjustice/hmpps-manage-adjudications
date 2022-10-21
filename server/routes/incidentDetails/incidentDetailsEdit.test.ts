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
    language: 'English',
    friendlyName: 'Udfsanaye Aidetria',
    displayName: 'Aidetria, Udfsanaye',
    prisonerNumber: 'G6415GD',
    currentLocation: 'Moorland (HMP & YOI)',
    dateOfBirth: undefined,
  })

  placeOnReportService.getDraftIncidentDetailsForEditing.mockResolvedValue({
    dateTime: { date: '08/11/2021', time: { hour: '10', minute: '00' } },
    locationId: 1234,
    startedByUserId: 'TESTER2_GEN',
    dateTimeOfDiscovery: { date: '08/11/2021', time: { hour: '10', minute: '00' } },
  })

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      startedByUserId: 'TEST_GEN',
      id: 34,
      incidentDetails: {
        dateTimeOfIncident: '2021-10-27T13:30:17.808Z',
        locationId: 2,
        discoveryRadioSelected: 'Yes',
      },
      incidentRole: {},
      prisonerNumber: 'G6415GD',
    },
  })

  placeOnReportService.editDraftIncidentDetails.mockResolvedValue({
    draftAdjudication: {
      startedByUserId: 'TEST_GEN',
      id: 34,
      incidentDetails: {
        dateTimeOfIncident: '2021-10-27T13:30:17.808Z',
        locationId: 2,
      },
      incidentRole: {},
      prisonerNumber: 'G6415GD',
    },
  })

  placeOnReportService.getReporterName.mockResolvedValue('Tester2 User')

  placeOnReportService.getNextOffencesUrl.mockResolvedValue(adjudicationUrls.ageOfPrisoner.urls.start(34) as never)

  locationService.getIncidentLocations.mockResolvedValue([
    { locationId: 5, locationPrefix: 'PC', userDescription: "Prisoner's cell" },
    { locationId: 6, locationPrefix: 'OC', userDescription: 'Rivendell' },
    { locationId: 2, locationPrefix: 'P2', userDescription: 'Hogwarts' },
    { locationId: 4, locationPrefix: 'P4', userDescription: 'Arundel' },
    { locationId: 1, locationPrefix: 'P1', userDescription: 'Timbuktu' },
    { locationId: 3, locationPrefix: 'P3', userDescription: 'Narnia' },
  ])
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /incident-details/<PRN>/<id>/edit', () => {
  it('should load the incident details edit page', () => {
    return request(app)
      .get(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 5))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Incident details')
        expect(res.text).toContain('Tester2 User')
      })
  })
})

describe('POST /incident-details/<PRN>/<id>/edit', () => {
  it('should redirect to the applicable rule page if details are complete after changing information and there are no offences saved', () => {
    return request(app)
      .post(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        discoveryRadioSelected: 'Yes',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.ageOfPrisoner.urls.start(34))
  })
  it('should redirect to the applicable rule page if details are complete after changing information and there are already offences on the draft', () => {
    placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
      draftAdjudication: {
        startedByUserId: 'TEST_GEN',
        id: 34,
        incidentDetails: {
          dateTimeOfIncident: '2021-10-27T13:30:17.808Z',
          locationId: 2,
          discoveryRadioSelected: 'Yes',
        },
        incidentRole: {},
        prisonerNumber: 'G6415GD',
        offenceDetails: [
          {
            offenceCode: 16001,
            offenceRule: {
              paragraphNumber: '16',
              paragraphDescription:
                'Intentionally or recklessly sets fire to any part of a prison or any other property, whether or not their own',
            },
          },
        ],
      },
    })
    placeOnReportService.getNextOffencesUrl.mockResolvedValue(adjudicationUrls.detailsOfOffence.urls.start(34) as never)

    return request(app)
      .post(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '13', minute: '30' } },
        locationId: 2,
        discoveryRadioSelected: 'Yes',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.detailsOfOffence.urls.start(34))
  })
  it('should render an error summary with correct validation message - user enters invalid hour', () => {
    return request(app)
      .post(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
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
      .post(adjudicationUrls.incidentDetails.urls.edit('G6415GD', 34))
      .send({
        incidentDate: { date: '27/10/2021', time: { hour: '12', minute: '30' } },
        locationId: 2,
        discoveryRadioSelected: 'Yes',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
})
