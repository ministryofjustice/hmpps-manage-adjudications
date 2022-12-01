import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')
jest.mock('../../services/decisionTreeService.ts')
jest.mock('../../services/reportedAdjudicationsService.ts')

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>
const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, locationService, decisionTreeService, reportedAdjudicationsService }
  )
  placeOnReportService.getPrisonerDetails.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'UDFSANAYE',
    lastName: 'AIDETRIA',
    physicalAttributes: { gender: 'Unknown' },
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
      gender: 'MALE',
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
      physicalAttributes: { gender: 'Unknown' },
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
        label: 'Date of incident',
        value: '9 December 2021',
      },
      {
        label: 'Time of incident',
        value: '10:30',
      },
      {
        label: 'Location',
        value: 'Rivendell',
      },
    ],
  })

  reportedAdjudicationsService.getReviewDetails.mockResolvedValue({
    reviewStatus: 'Returned',
    reviewSummary: [
      {
        label: 'Last reviewed by',
        value: 'T. User',
      },
      {
        label: 'Reason for return',
        value: 'offence',
      },
      {
        label: 'Details',
        value: 'wrong',
      },
    ],
  })

  placeOnReportService.completeDraftAdjudication.mockResolvedValue(2342)

  placeOnReportService.getGenderDataForTable.mockResolvedValue(null)
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
        expect(response.text).toContain('Status: Returned')
        expect(response.text).toContain('Last reviewed by')
        expect(response.text).toContain('Reason for return')
        expect(response.text).toContain('Confirm changes')
        expect(response.text).not.toContain('What is the gender of the prisoner?')
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
      .expect('Location', adjudicationUrls.confirmedOnReport.urls.confirmationOfChange(2342))
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
