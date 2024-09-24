import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ConfirmedOnReportData } from '../../data/ConfirmedOnReportData'
import TestData from '../testutils/testData'
import Dis7BlackPdf from './dis7BlankPdf'

jest.mock('../../services/reportedAdjudicationsService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

const testData = new TestData()

const reportedAdjudicationAdult: ReportedAdjudication = testData.reportedAdjudication({
  chargeNumber: '1524493',
  prisonerNumber: 'G6415GD',
  isYouthOffender: false,
})

const reportedAdjudicationYoi: ReportedAdjudication = testData.reportedAdjudication({
  chargeNumber: '1524493',
  prisonerNumber: 'G6415GD',
  isYouthOffender: true,
})

const confirmedOnReportData = (isYoi: boolean): ConfirmedOnReportData => {
  return {
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
    isYouthOffender: isYoi,
    prisonName: 'MDI',
  }
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /dis7', () => {
  it('should render a PDF view of an dis7 report for YOI', async () => {
    reportedAdjudicationsService.getConfirmationDetails.mockResolvedValue(confirmedOnReportData(true))

    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: reportedAdjudicationYoi,
    })

    const res: Response = {
      render: jest.fn(),
      renderPdf: jest.fn(),
      redirect: jest.fn(),
      locals: {},
    } as unknown as Response

    const req: Request = {
      params: { chargeNumber: reportedAdjudicationYoi.chargeNumber },
    } as unknown as Request
    await new Dis7BlackPdf(reportedAdjudicationsService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/adjudicationResultReportBlank',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        data: {
          chargeNumber: '1524493',
          establishmentName: 'MDI',
          prisonerDisplayName: 'Smith, John',
          prisonerNumber: 'H5123BY',
          prisonerLocationDescription: 'Moorland (HMP & YOI) - 5-2-A-050',
          isYOI: true,
          canteenDaysMax: 21,
          facilitiesDaysMax: 21,
          privateCashDaysMax: 21,
          tvDaysMax: 21,
          associationDaysMax: 21,
          anyPrivilegeDaysMax: 21,
          stoppageOfEarningsDaysMax: 42,
          cellularConfinementDaysMax: 10,
          removalDaysMax: 21,
          daysAddedDaysMax: 42,
          prospectiveDaysMax: 42,
          applyMonths: 4,
          reportedDate: '21 December 2020',
        },
      },
      'pages/adjudicationResultReportHeader',
      { chargeNumber: '1524493', header: 'Adjudication result – Young Offender (YOI Rule 55)' },
      'pages/adjudicationResultReportFooter',
      {},
      {
        filename: 'adjudication-result-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0', scale: '0.93', },
      }
    )
  })
  it('should render a PDF view of an dis7 report for Adult', async () => {
    reportedAdjudicationsService.getConfirmationDetails.mockResolvedValue(confirmedOnReportData(false))
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: reportedAdjudicationAdult,
    })

    const res: Response = {
      render: jest.fn(),
      renderPdf: jest.fn(),
      redirect: jest.fn(),
      locals: {},
    } as unknown as Response

    const req: Request = {
      params: { chargeNumber: reportedAdjudicationAdult.chargeNumber },
    } as unknown as Request
    await new Dis7BlackPdf(reportedAdjudicationsService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/adjudicationResultReportBlank',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        data: {
          chargeNumber: '1524493',
          establishmentName: 'MDI',
          prisonerDisplayName: 'Smith, John',
          prisonerNumber: 'H5123BY',
          isYOI: false,
          prisonerLocationDescription: 'Moorland (HMP & YOI) - 5-2-A-050',
          canteenDaysMax: 42,
          facilitiesDaysMax: 42,
          privateCashDaysMax: 42,
          tvDaysMax: 42,
          associationDaysMax: 42,
          anyPrivilegeDaysMax: 42,
          stoppageOfEarningsDaysMax: 84,
          cellularConfinementDaysMax: 21,
          removalDaysMax: 28,
          daysAddedDaysMax: 42,
          prospectiveDaysMax: 42,
          applyMonths: 6,
          reportedDate: '21 December 2020',
        },
      },
      'pages/adjudicationResultReportHeader',
      { chargeNumber: '1524493', header: 'Adjudication result – Adult (Prison Rule 51)' },
      'pages/adjudicationResultReportFooter',
      {},
      {
        filename: 'adjudication-result-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0', scale: '0.93', },
      }
    )
  })
})
