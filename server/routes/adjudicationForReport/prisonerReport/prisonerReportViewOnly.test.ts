import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import LocationService from '../../../services/locationService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../../services/decisionTreeService'
import { IncidentRole } from '../../../incidentRole/IncidentRole'
import adjudicationUrls from '../../../utils/urlGenerator'
import TestData from '../../testutils/testData'

jest.mock('../../../services/locationService.ts')
jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/decisionTreeService.ts')

const testData = new TestData()
const locationService = new LocationService(null) as jest.Mocked<LocationService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const decisionTreeService = new DecisionTreeService(null, null, null, null) as jest.Mocked<DecisionTreeService>

let app: Express

beforeEach(() => {
  reportedAdjudicationsService.createDraftFromCompleteAdjudication.mockResolvedValue(12345)

  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber: 12345,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2021-12-09T10:30:00',
    }),
  })

  const prisoner = testData.prisonerResultSummary({
    offenderNo: 'G5512GK',
    firstName: 'BOBBY',
    lastName: 'DA SMITH JONES',
    assignedLivingUnitDesc: '1-1-010',
  })

  decisionTreeService.adjudicationIncidentData.mockResolvedValue({
    incidentRole: IncidentRole.COMMITTED,
    prisoner,
    associatedPrisoner: undefined,
  })
  reportedAdjudicationsService.getTransferBannerInfo.mockResolvedValue({
    transferBannerContent: null,
    originatingAgencyToAddOutcome: false,
  })
  locationService.getIncidentLocations.mockResolvedValue(testData.residentialLocations())

  reportedAdjudicationsService.getPrisonerReport.mockResolvedValue({
    isYouthOffender: false,
    incidentDetails: [
      {
        label: 'Reporting Officer',
        value: 'T. User',
      },
      {
        label: 'Date of incident',
        value: '8 March 2020',
      },
      {
        label: 'Time of incident',
        value: '10:45',
      },
      {
        label: 'Location',
        value: 'Chapel',
      },
      {
        label: 'Date of discovery',
        value: '8 March 2020',
      },
      {
        label: 'Time of discovery',
        value: '10:45',
      },
    ],
    statement: 'text here',
  })

  const qAndAs = [
    {
      question: 'What type of offence did Bobby Da Smith Jones commit?',
      answer: 'Assault, fighting, or endangering the health or personal safety of others',
    },
    {
      question: 'What did the incident involve?',
      answer: 'Assaulting someone',
    },
    {
      question: 'Who was assaulted?',
      answer: 'Another prisoner - John Saunders',
    },
    {
      question: 'Was the incident a racially aggravated assault?',
      answer: 'No',
    },
  ]

  decisionTreeService.getAdjudicationOffences.mockResolvedValue({
    questionsAndAnswers: qAndAs,
    incidentRule: undefined,
    offenceRule: {
      paragraphNumber: '1',
      paragraphDescription: 'Commits any assault',
    },
  })

  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, locationService, decisionTreeService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET prisoner report', () => {
  it('should load the prisoner report page', () => {
    return request(app)
      .get(adjudicationUrls.prisonerReport.urls.viewOnly(12345))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('10:45')
        expect(response.text).toContain('Chapel')
        expect(response.text).toContain('What type of offence did Bobby Da Smith Jones commit?')
        expect(response.text).toContain('Assault, fighting, or endangering the health or personal safety of others')
        expect(response.text).toContain('What did the incident involve?')
        expect(response.text).toContain('Assaulting someone')
        expect(response.text).toContain('Who was assaulted?')
        expect(response.text).toContain('Another prisoner - John Saunders')
        expect(response.text).toContain('Was the incident a racially aggravated assault?')
        expect(response.text).toContain('No')
        expect(response.text).toContain('This offence broke')
        expect(response.text).toContain('Prison rule 51, paragraph 1')
        expect(reportedAdjudicationsService.getPrisonerReport).toHaveBeenCalledTimes(1)
      })
  })
})
