import { Request, Response } from 'express'

import UserService from '../../services/userService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import { AnswerType as Type } from '../../offenceCodeDecisions/Answer'
import { OffenceRule } from '../../data/DraftAdjudicationResult'
import AdjudicationPdf from './adjudicationPdf'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ConfirmedOnReportData } from '../../data/ConfirmedOnReportData'
import { answer, question } from '../../offenceCodeDecisions/Decisions'
import TestData from '../testutils/testData'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/placeOnReportService.ts')

const testDecisionsTree = question('A question').child(answer('An answer').type(Type.PRISONER).offenceCode(1))

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null) as jest.Mocked<UserService>

const testData = new TestData()

const placeOnReportService = new PlaceOnReportService(null) as jest.Mocked<PlaceOnReportService>
const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  testDecisionsTree
)

const offenceRule: OffenceRule = {
  paragraphDescription: 'Commits any assault',
  paragraphNumber: '1',
}

const reportedAdjudication: ReportedAdjudication = testData.reportedAdjudication({
  adjudicationNumber: 1524493,
  prisonerNumber: 'G6415GD',
  locationId: 197682,
  dateTimeOfIncident: '2021-12-09T10:30:00',
  offenceDetails: { offenceCode: 1, offenceRule },
})

const prisonerResultSummary: PrisonerResultSummary = testData.prisonerResultSummary({
  offenderNo: 'G6415GD',
  firstName: 'John',
  lastName: 'Smith',
})

const confirmedOnReportData: ConfirmedOnReportData = {
  reportExpirationDateTime: '2020-12-23T07:21',
  prisonerFirstName: 'John',
  prisonerLastName: 'Smith',
  prisonerNumber: 'H5123BY',
  prisonerPreferredNonEnglishLanguage: 'French',
  prisonerOtherLanguages: ['English', 'Spanish'],
  prisonerNeurodiversities: ['Moderate learning difficulty', 'Dyslexia'],
  incidentAgencyName: 'Moorland (HMP & YOI)',
  incidentLocationName: 'Adj',
  statement: 'A statement',
  reportingOfficer: 'An officer',
  prisonerAgencyName: 'Moorland (HMP & YOI)',
  prisonerLivingUnitName: '5-2-A-050',
  incidentDate: '2020-12-21T07:21',
  createdDateTime: '2020-12-21T10:45',
  isYouthOffender: false,
}

beforeEach(() => {
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({ reportedAdjudication })
  placeOnReportService.getOffenceRule.mockResolvedValue(offenceRule)
  placeOnReportService.getPrisonerDetails.mockResolvedValue(prisonerResultSummary)
  reportedAdjudicationsService.getConfirmationDetails.mockResolvedValue(confirmedOnReportData)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /all-completed-reports', () => {
  it('should render a PDF view of an adjudication', async () => {
    const res: Response = {
      render: jest.fn(),
      renderPdf: jest.fn(),
      redirect: jest.fn(),
      locals: {},
    } as unknown as Response

    const req: Request = {
      params: { adjudicationNumber: reportedAdjudication.adjudicationNumber },
    } as unknown as Request
    await new AdjudicationPdf(reportedAdjudicationsService, decisionTreeService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/noticeOfBeingPlacedOnReport',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        noticeOfBeingPlacedOnReportData: {
          adjudicationNumber: 1524493,
          expirationDay: 'Wednesday 23 December',
          expirationTime: '07:21',
          incidentDate: '21 December 2020',
          incidentLocationDescription: 'Moorland (HMP & YOI) - Adj',
          isYouthOffender: false,
          incidentTime: '07:21',
          offences: {
            incidentRule: undefined,
            offenceRule: {
              paragraphDescription: 'Commits any assault',
              paragraphNumber: '1',
            },
            questionsAndAnswers: [
              {
                answer: 'An answer',
                question: 'A question',
              },
            ],
          },
          prisonerDisplayName: 'Smith, John',
          prisonerFriendlyName: 'John Smith',
          prisonerLocationDescription: 'Moorland (HMP & YOI) - 5-2-A-050',
          prisonerNumber: 'H5123BY',
          reportedDate: '21 December 2020',
          reportedTime: '10:45',
          reportingOfficer: 'An Officer',
          statement: 'A statement',
        },
      },
      'pages/noticeOfBeingPlacedOnReportHeader',
      {},
      'pages/noticeOfBeingPlacedOnReportFooter',
      { adjudicationNumber: 1524493 },
      {
        filename: 'adjudication-report-1524493',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '0.9' },
      }
    )
  })
})
