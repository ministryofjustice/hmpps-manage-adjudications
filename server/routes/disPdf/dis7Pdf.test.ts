import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { DIS7Data } from '../../data/ConfirmedOnReportData'
import TestData from '../testutils/testData'
import Dis7Pdf from './dis7Pdf'
import { PunishmentMeasurement, PunishmentType } from '../../data/PunishmentResult'

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

const punishments = [
  testData.punishmentWithSchedule({
    type: PunishmentType.CONFINEMENT,
    otherPrivilege: null,
    privilegeType: null,
  }),
]

const suspendedPunishments = [
  testData.punishmentWithSchedule({
    type: PunishmentType.CONFINEMENT,
    otherPrivilege: null,
    privilegeType: null,
    schedule: {
      suspendedUntil: '2022-01-01T00:00',
      duration: 20,
      measurement: PunishmentMeasurement.DAYS,
    },
  }),
]

const data = (isYoi: boolean): DIS7Data => {
  return {
    reportExpirationDateTime: '2020-12-23T07:21',
    prisonerFirstName: 'John',
    prisonerLastName: 'Smith',
    prisonerNumber: 'H5123BY',
    incidentAgencyName: 'Moorland (HMP & YOI)',
    incidentLocationName: 'Adj',
    statement: 'A statement',
    prisonerAgencyName: 'Moorland (HMP & YOI)',
    prisonerLivingUnitName: '5-2-A-050',
    incidentDate: '2020-12-21T07:21',
    createdDateTime: '2020-12-21T10:45',
    prisonName: 'MDI',
    adjudicatorType: 'GOV',
    ccPunishmentAwarded: false,
    adaGiven: false,
    lastHearingDate: '2020-12-22T09:00',
    adjudicatorName: 'Steven Paulette',
    damagesAmount: null,
    isYouthOffender: isYoi,
    cautionGiven: false,
    punishments,
    suspendedPunishments,
    suspendedPunishmentsPresent: true,
  }
}

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /dis7', () => {
  it('should render a PDF view of an dis7 report for YOI', async () => {
    reportedAdjudicationsService.getDetailsForDIS7.mockResolvedValue(data(true))
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
    await new Dis7Pdf(reportedAdjudicationsService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/adjudicationResultReport',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        data: {
          chargeNumber: '1524493',
          prisonerDisplayName: 'Smith, John',
          prisonerNumber: 'H5123BY',
          prisonerLocationDescription: 'Moorland (HMP & YOI) - 5-2-A-050',
          reportedDate: '21 December 2020',
          adjudicatorType: 'GOV',
          ccPunishmentAwarded: false,
          adaGiven: false,
          isYOI: true,
          adjudicatorName: 'Steven Paulette',
          lastHearingDate: '2020-12-22T09:00',
          damagesAmount: null,
          cautionGiven: false,
          punishments,
          suspendedPunishments,
          suspendedPunishmentsPresent: true,
        },
      },
      'pages/adjudicationResultReportHeader',
      { chargeNumber: '1524493', header: 'Result of your adjudication' },
      'pages/adjudicationResultReportFooter',
      {},
      {
        filename: 'adjudication-result-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0' },
      },
      false
    )
  })
  it('should render a PDF view of an dis7 report for Adult', async () => {
    reportedAdjudicationsService.getDetailsForDIS7.mockResolvedValue(data(false))
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
    await new Dis7Pdf(reportedAdjudicationsService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/adjudicationResultReport',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        data: {
          chargeNumber: '1524493',
          prisonerDisplayName: 'Smith, John',
          prisonerNumber: 'H5123BY',
          prisonerLocationDescription: 'Moorland (HMP & YOI) - 5-2-A-050',
          reportedDate: '21 December 2020',
          adjudicatorType: 'GOV',
          ccPunishmentAwarded: false,
          adaGiven: false,
          isYOI: false,
          adjudicatorName: 'Steven Paulette',
          lastHearingDate: '2020-12-22T09:00',
          damagesAmount: null,
          cautionGiven: false,
          punishments,
          suspendedPunishments,
          suspendedPunishmentsPresent: true,
        },
      },
      'pages/adjudicationResultReportHeader',
      { chargeNumber: '1524493', header: 'Result of your adjudication' },
      'pages/adjudicationResultReportFooter',
      {},
      {
        filename: 'adjudication-result-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0' },
      },
      false
    )
  })
})
