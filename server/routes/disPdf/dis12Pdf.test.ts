import { Request, Response } from 'express'

import UserService from '../../services/userService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import { AnswerType as Type } from '../../offenceCodeDecisions/Answer'
import { OffenceRule } from '../../data/DraftAdjudicationResult'
import Dis12Pdf from './dis12Pdf'
import { OicHearingType, ReportedAdjudication, ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import { ConfirmedOnReportData } from '../../data/ConfirmedOnReportData'
import { answer, question } from '../../offenceCodeDecisions/Decisions'
import TestData from '../testutils/testData'
import { HearingOutcomeCode } from '../../data/HearingAndOutcomeResult'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/userService.ts')
jest.mock('../../services/placeOnReportService.ts')

const testDecisionsTree = question('A question').child(answer('An answer').type(Type.PRISONER).offenceCode(1))

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null, null) as jest.Mocked<UserService>

const testData = new TestData()

const placeOnReportService = new PlaceOnReportService(null, null, null) as jest.Mocked<PlaceOnReportService>
const decisionTreeService = new DecisionTreeService(
  placeOnReportService,
  userService,
  reportedAdjudicationsService,
  testDecisionsTree,
  []
)

const offenceRule: OffenceRule = {
  paragraphDescription: 'Commits any assault',
  paragraphNumber: '1',
}

const reportedAdjudication: ReportedAdjudication = testData.reportedAdjudication({
  chargeNumber: '1524493',
  prisonerNumber: 'G6415GD',
  locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
  dateTimeOfIncident: '2021-12-09T10:30:00',
  offenceDetails: { offenceCode: 1, offenceRule },
  status: ReportedAdjudicationStatus.SCHEDULED,
  hearings: [
    testData.singleHearing({
      dateTimeOfHearing: '2023-09-02T10:50:00.000',
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      outcome: testData.hearingOutcome({
        code: HearingOutcomeCode.ADJOURN,
        optionalItems: { details: 'adjourned details', reason: 'LEGAL_ADVICE', plea: 'NOT_ASKED' },
      }),
    }),
    testData.singleHearing({
      dateTimeOfHearing: '2023-09-03T12:00:00.000',
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      oicHearingType: OicHearingType.INAD_ADULT,
    }),
  ],
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
  it('should render a PDF view of an adjudication for prisoners', async () => {
    const res: Response = {
      render: jest.fn(),
      renderPdf: jest.fn(),
      redirect: jest.fn(),
      locals: {},
    } as unknown as Response

    const req: Request = {
      params: { chargeNumber: reportedAdjudication.chargeNumber },
      query: { copy: 'prisoner' },
    } as unknown as Request
    await new Dis12Pdf(reportedAdjudicationsService, decisionTreeService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/noticeOfBeingPlacedOnReport',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        noticeOfBeingPlacedOnReportData: {
          chargeNumber: '1524493',
          expirationDay: 'Wednesday, 23 December 2020',
          expirationTime: '07:21',
          incidentDate: 'Monday, 21 December 2020',
          incidentLocationDescription: 'Moorland (HMP & YOI) - Adj',
          isPrisonerCopy: true,
          isYouthOffender: false,
          nextHearingDate: 'Sunday 3 September',
          nextHearingTime: '12:00',
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
      { chargeNumber: '1524493' },
      'pages/noticeOfBeingPlacedOnReportFooter',
      {},
      {
        filename: 'notice-of-being-placed-on-report-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0', scale: '0.93' },
      }
    )
  })

  it('should render a PDF view of an adjudication for prisoners - no adjournments', async () => {
    const reportedAdjudicationWithoutHearing = testData.reportedAdjudication({
      chargeNumber: '1524493',
      prisonerNumber: 'G6415GD',
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      dateTimeOfIncident: '2021-12-09T10:30:00',
      offenceDetails: { offenceCode: 1, offenceRule },
    })
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
      reportedAdjudication: reportedAdjudicationWithoutHearing,
    })

    const res: Response = {
      render: jest.fn(),
      renderPdf: jest.fn(),
      redirect: jest.fn(),
      locals: {},
    } as unknown as Response

    const req: Request = {
      params: { chargeNumber: reportedAdjudicationWithoutHearing.chargeNumber },
      query: { copy: 'prisoner' },
    } as unknown as Request
    await new Dis12Pdf(reportedAdjudicationsService, decisionTreeService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/noticeOfBeingPlacedOnReport',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        noticeOfBeingPlacedOnReportData: {
          chargeNumber: '1524493',
          expirationDay: 'Wednesday, 23 December 2020',
          expirationTime: '07:21',
          incidentDate: 'Monday, 21 December 2020',
          incidentLocationDescription: 'Moorland (HMP & YOI) - Adj',
          isPrisonerCopy: true,
          isYouthOffender: false,
          nextHearingDate: undefined,
          nextHearingTime: undefined,
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
      { chargeNumber: '1524493' },
      'pages/noticeOfBeingPlacedOnReportFooter',
      {},
      {
        filename: 'notice-of-being-placed-on-report-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0', scale: '0.93' },
      }
    )
  })

  it('should render a PDF view of an adjudication for staff', async () => {
    const res: Response = {
      render: jest.fn(),
      renderPdf: jest.fn(),
      redirect: jest.fn(),
      locals: {},
    } as unknown as Response

    const req: Request = {
      params: { chargeNumber: reportedAdjudication.chargeNumber },
      query: { copy: 'staff ' },
    } as unknown as Request
    await new Dis12Pdf(reportedAdjudicationsService, decisionTreeService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/noticeOfBeingPlacedOnReport',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        noticeOfBeingPlacedOnReportData: {
          chargeNumber: '1524493',
          expirationDay: 'Wednesday, 23 December 2020',
          expirationTime: '07:21',
          incidentDate: 'Monday, 21 December 2020',
          incidentLocationDescription: 'Moorland (HMP & YOI) - Adj',
          isPrisonerCopy: false,
          isYouthOffender: false,
          nextHearingDate: undefined,
          nextHearingTime: undefined,
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
      { chargeNumber: '1524493' },
      'pages/noticeOfBeingPlacedOnReportFooter',
      {},
      {
        filename: 'notice-of-being-placed-on-report-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0', scale: '0.93' },
      }
    )
  })
})
