import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import DecisionTreeService from '../../services/decisionTreeService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/placeOnReportService.ts')
jest.mock('../../services/locationService.ts')
jest.mock('../../services/decisionTreeService.ts')
jest.mock('../../services/reportedAdjudicationsService.ts')

const testData = new TestData()
const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const locationService = new LocationService(null) as jest.Mocked<LocationService>
const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

const prisonerData = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'Udfsanaye',
  lastName: 'Aidetria',
  gender: 'Unknown',
})

const draftData = testData.draftAdjudication({
  id: 1,
  adjudicationNumber: 123,
  prisonerNumber: 'G6415GD',
})

beforeEach(() => {
  app = appWithAllRoutes(
    { production: false },
    { placeOnReportService, locationService, decisionTreeService, reportedAdjudicationsService }
  )
  placeOnReportService.getPrisonerDetails.mockResolvedValue(prisonerData)

  decisionTreeService.draftAdjudicationIncidentData.mockResolvedValue({
    draftAdjudication: {
      ...draftData,
    },
    incidentRole: undefined,
    prisoner: prisonerData,
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

  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber: 123,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2023-05-30T09:30:00',
    }),
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

  placeOnReportService.completeDraftAdjudication.mockResolvedValue('2342')

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
      .expect('Location', adjudicationUrls.confirmedOnReport.urls.confirmationOfChange('2342'))
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
