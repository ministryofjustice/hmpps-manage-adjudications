import { Request, Response } from 'express'

import UserService from '../../services/userService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService, { PrisonerResultSummary } from '../../services/placeOnReportService'
import { AnswerType as Type } from '../../offenceCodeDecisions/Answer'
import { DamageCode, EvidenceCode, OffenceRule, WitnessCode } from '../../data/DraftAdjudicationResult'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ConfirmedOnReportData } from '../../data/ConfirmedOnReportData'
import { answer, question } from '../../offenceCodeDecisions/Decisions'
import TestData from '../testutils/testData'
import Dis3Pdf from './dis3Pdf'

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
  locationId: 197682,
  dateTimeOfIncident: '2021-12-09T10:30:00',
  offenceDetails: { offenceCode: 1, offenceRule },
  damages: [
    {
      code: DamageCode.ELECTRICAL_REPAIR,
      details: 'Test',
      reporter: 'TEST_GEN',
    },
  ],
  evidence: [
    {
      code: EvidenceCode.PHOTO,
      details: 'Test',
      reporter: 'TEST_GEN',
    },
  ],
  witnesses: [
    {
      code: WitnessCode.OTHER_PERSON,
      firstName: 'Test',
      lastName: 'McTest',
      reporter: 'TEST_GEN',
    },
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
  it('should render a PDF view of an adjudication', async () => {
    const res: Response = {
      render: jest.fn(),
      renderPdf: jest.fn(),
      redirect: jest.fn(),
      locals: {},
    } as unknown as Response

    const req: Request = {
      params: { chargeNumber: reportedAdjudication.chargeNumber },
    } as unknown as Request
    await new Dis3Pdf(reportedAdjudicationsService, decisionTreeService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/prepareAndRecordAnAdjudicationHearing',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        prepareAndRecordAnAdjudicationHearingData: {
          chargeNumber: '1524493',
          isYOI: false,
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
          prisonerLocationDescription: 'Moorland (HMP & YOI) - 5-2-A-050',
          prisonerNumber: 'H5123BY',
          witnesses: [
            {
              code: 'OTHER_PERSON',
              firstName: 'Test',
              lastName: 'McTest',
              reporter: 'TEST_GEN',
            },
          ],
          damages: [
            {
              code: 'ELECTRICAL_REPAIR',
              details: 'Test',
              reporter: 'TEST_GEN',
            },
          ],
          evidence: {
            baggedAndTagged: [],
            other: [],
            photoVideo: [
              {
                code: 'PHOTO',
                details: 'Test',
                reporter: 'TEST_GEN',
              },
            ],
          },
        },
      },
      'pages/prepareAndRecordAnAdjudicationHearingHeader',
      { chargeNumber: '1524493' },
      'pages/prepareAndRecordAnAdjudicationHearingFooter',
      {},
      {
        filename: 'prepare-and-record-adjudication-hearing-1524493.pdf',
        pdfMargins: { marginBottom: '0.8', marginLeft: '0.0', marginRight: '0.0', marginTop: '1.0', scale: '0.93' },
      }
    )
  })
})
