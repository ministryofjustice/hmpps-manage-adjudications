import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')
jest.mock('../../services/decisionTreeService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>
const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { placeOnReportService, locationService, decisionTreeService })
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    assignedLivingUnit: {
      agencyId: undefined,
      locationId: undefined,
      description: undefined,
      agencyName: undefined,
    },
    categoryCode: undefined,
    dateOfBirth: undefined,
    language: undefined,
    friendlyName: undefined,
    displayName: undefined,
    prisonerNumber: undefined,
    currentLocation: undefined,
  })

  decisionTreeService.draftAdjudicationIncidentData.mockResolvedValue({
    draftAdjudication: {
      id: 1,
      adjudicationNumber: 123,
      prisonerNumber: 'G6415GD',
      incidentDetails: {
        locationId: 6,
        dateTimeOfIncident: undefined,
        handoverDeadline: undefined,
      },
      incidentRole: {
        roleCode: '25a',
      },
      offenceDetails: [
        {
          offenceCode: 4,
          victimPrisonersNumber: '',
        },
      ],
      incidentStatement: { statement: '', completed: true },
      startedByUserId: undefined,
    },
    incidentRole: undefined,
    prisoner: {
      offenderNo: 'G6415GD',
      dateOfBirth: undefined,
      firstName: undefined,
      lastName: undefined,
      assignedLivingUnit: {
        agencyId: undefined,
        locationId: undefined,
        description: undefined,
        agencyName: undefined,
      },
      categoryCode: undefined,
      language: undefined,
      friendlyName: undefined,
      displayName: undefined,
      prisonerNumber: undefined,
      currentLocation: undefined,
    },
    associatedPrisoner: undefined,
  })

  locationService.getIncidentLocations.mockResolvedValue([
    { locationId: 6, locationPrefix: 'OC', userDescription: 'Rivendell' },
  ])

  placeOnReportService.getCheckYourAnswersInfo.mockResolvedValue({
    isYouthOffender: false,
    statement: '',
    incidentDetails: [
      {
        label: 'Reporting Officer',
        value: 'Test McTest',
      },
      {
        label: 'Date',
        value: '9 December 2021',
      },
      {
        label: 'Time',
        value: '10:30',
      },
      {
        label: 'Location',
        value: 'Rivendell',
      },
    ],
  })

  placeOnReportService.completeDraftAdjudication.mockResolvedValue(2342)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /check-your-answers', () => {
  it('should load the check-your-answers page', () => {
    return request(app)
      .get(adjudicationUrls.checkYourAnswers.urls.report(1))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Check your answers')
        expect(response.text).toContain('Confirm changes')
        expect(response.text).not.toContain(
          'By accepting these details you are confirming that, to the best of your knowledge, these details are correct.'
        )
        expect(placeOnReportService.getCheckYourAnswersInfo).toHaveBeenCalledTimes(1)
      })
  })
})

describe('POST /check-your-answers', () => {
  it('should redirect to the correct page if details is complete', () => {
    return request(app)
      .post(adjudicationUrls.checkYourAnswers.urls.report(1))
      .expect(302)
      .expect('Location', adjudicationUrls.confirmedOnReport.urls.reporterView(2342))
  })

  it('should throw an error on api failure', () => {
    placeOnReportService.completeDraftAdjudication.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(adjudicationUrls.checkYourAnswers.urls.report(1))
      .expect(response => {
        expect(response.text).toContain('Error: Internal Error')
      })
  })
})
