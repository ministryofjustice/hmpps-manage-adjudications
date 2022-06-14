import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService })
  placeOnReportService.getPrisonerDetailsFromAdjNumber.mockResolvedValue({
    offenderNo: 'A7937DY',
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
    prisonerNumber: 'A7937DY',
    currentLocation: 'Moorland (HMP & YOI)',
  })

  placeOnReportService.getDraftAdjudicationDetails.mockResolvedValue({
    draftAdjudication: {
      id: 1041,
      prisonerNumber: 'A7937DY',
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

describe('GET /age-of-prisoner', () => {
  it('should load the age of prisoner page', () => {
    return request(app)
      .get(adjudicationUrls.ageOfPrisoner.urls.start(1041))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Age of the prisoner')
      })
  })
})

describe('POST /age-of-prisoner', () => {
  it('should redirect to the role page if the form is complete', () => {
    return request(app)
      .post(adjudicationUrls.ageOfPrisoner.urls.start(1041))
      .send({ whichRuleChosen: 'adult' })
      .expect('Location', '/incident-role/1041') // TODO: Use adjudicationUrls for this once it's available
  })
  // TODO: Add test which makes sure the API is called with the correct parameters, once API call added in.
  it('should render error summary with correct validation message', () => {
    return request(app)
      .post(adjudicationUrls.ageOfPrisoner.urls.start(1041))
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select which rules apply.')
      })
  })
  // TODO: Add test for API call failure once API call is added into route
})
