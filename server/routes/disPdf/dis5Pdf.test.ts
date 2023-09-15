import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ConfirmedOnReportData } from '../../data/ConfirmedOnReportData'
import TestData from '../testutils/testData'
import Dis5Pdf from './dis5Pdf'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/placeOnReportService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

const testData = new TestData()

const reportedAdjudication: ReportedAdjudication = testData.reportedAdjudication({
  chargeNumber: '1524493',
  prisonerNumber: 'G6415GD',
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
  prisonName: 'MDI',
}

beforeEach(() => {
  reportedAdjudicationsService.getConfirmationDetails.mockResolvedValue(confirmedOnReportData)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /dis5', () => {
  it('should render a PDF view of an DIS5 report', async () => {
    const res: Response = {
      render: jest.fn(),
      renderPdf: jest.fn(),
      redirect: jest.fn(),
      locals: {},
    } as unknown as Response

    const req: Request = {
      params: { chargeNumber: reportedAdjudication.chargeNumber },
    } as unknown as Request
    await new Dis5Pdf(reportedAdjudicationsService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/adjudicationHistoryForCurrentSentence',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        adjudicationHistoryForCurrentSentenceData: {
          chargeNumber: '1524493',
          prisonerDisplayName: 'Smith, John',
          prisonerLocationDescription: 'Moorland (HMP & YOI) - 5-2-A-050',
          prisonerNumber: 'H5123BY',
          incidentDate: 'Monday, 21 December 2020',
        },
      },
      'pages/adjudicationHistoryForCurrentSentenceHeader',
      { chargeNumber: '1524493' },
      'pages/adjudicationHistoryForCurrentSentenceFooter',
      {},
      {
        filename: 'adjudication-history-for-current-sentence-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0' },
      }
    )
  })
})
