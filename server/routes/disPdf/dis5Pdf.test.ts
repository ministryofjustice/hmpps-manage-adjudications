import { Request, Response } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { ReportedAdjudication } from '../../data/ReportedAdjudicationResult'
import { ConfirmedOnReportData } from '../../data/ConfirmedOnReportData'
import TestData from '../testutils/testData'
import Dis5Pdf from './dis5Pdf'
import PrisonerSearchService from '../../services/prisonerSearchService'
import { PunishmentType } from '../../data/PunishmentResult'
import { Dis5AdjudicationsAndDamageObligationsPrintSupport } from '../../data/manageAdjudicationsSystemTokensClient'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/prisonerSearchService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const prisonerSearchService = new PrisonerSearchService(null) as jest.Mocked<PrisonerSearchService>

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

const prisonerSearchDis5Data = {
  currentIncentiveLevel: 'Basic',
  dateTimeOfLevel: '2020-09-01',
  nextReviewDate: '2025-09-01',
}

const dis5Data = {
  chargeNumber: 'MDI-000060',
  dateOfIncident: '2023-02-10',
  dateOfDiscovery: '2023-02-10',
  previousCount: 2,
  previousAtCurrentEstablishmentCount: 2,
  sameOffenceCount: 0,
  chargesWithSuspendedPunishments: [
    {
      dateOfIncident: '2023-01-01',
      dateOfDiscovery: '2023-01-01',
      chargeNumber: 'MDI-000010',
      suspendedPunishments: [
        {
          type: PunishmentType.EXCLUSION_WORK,
          schedule: {
            days: 10,
            suspendedUntil: '2023-01-30',
          },
        },
      ],
    },
  ],
  existingPunishments: [
    {
      type: PunishmentType.EXCLUSION_WORK,
      schedule: {
        days: 10,
        startDate: '2023-01-05',
        endDate: '2023-01-15',
      },
    },
  ],
  damageObligations: [
    {
      id: 1,
      offenderNo: 'H5123BY',
      referenceNumber: '12345',
      startDateTime: '2020-01-05',
      endDateTime: '2020-01-05',
      prisonId: 'MDI',
      amountToPay: 100,
      amountPaid: 20,
      status: 'ACTIVE',
      comment: 'NA',
      currency: 'GBP',
    },
  ],
}
beforeEach(() => {
  reportedAdjudicationsService.getConfirmationDetails.mockResolvedValue(confirmedOnReportData)
  prisonerSearchService.getPrisonerDetailsForDis5.mockResolvedValue(prisonerSearchDis5Data)
  reportedAdjudicationsService.getDis5Data.mockResolvedValue(
    dis5Data as unknown as Dis5AdjudicationsAndDamageObligationsPrintSupport
  )
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
    await new Dis5Pdf(reportedAdjudicationsService, prisonerSearchService).renderPdf(req, res)
    expect(res.renderPdf).toHaveBeenCalled()
    expect(res.renderPdf).toHaveBeenCalledWith(
      'pages/adjudicationHistoryForCurrentSentence',
      {
        adjudicationsUrl: 'http://host.docker.internal:3000',
        adjudicationHistoryForCurrentSentenceData: {
          chargeNumber: '1524493',
          prisonerDisplayName: 'Smith, John',
          prisonerFriendlyName: 'John Smith',
          prisonerLocationDescription: 'Moorland (HMP & YOI) - 5-2-A-050',
          prisonerNumber: 'H5123BY',
          chargeProvedAtCurrentEstablishmentCount: 2,
          chargeProvedSentenceCount: 2,
          sameOffenceCount: 0,
          lastReportedOffence: {},
          discoveryDate: 'Friday, 10 February 2023',
          currentIncentiveLevel: 'Basic',
          incentiveNextReviewDate: '2025-09-01',
          currentIncentiveLevelDateTime: '2020-09-01',
          acctAlertPresent: undefined,
          autoReleaseDate: undefined,
          conditionalReleaseDate: undefined,
          csipAlertPresent: undefined,
          damageObligations: [
            {
              id: 1,
              offenderNo: 'H5123BY',
              referenceNumber: '12345',
              startDateTime: '2020-01-05',
              endDateTime: '2020-01-05',
              prisonId: 'MDI',
              amountToPay: 100,
              amountPaid: 20,
              status: 'ACTIVE',
              comment: 'NA',
              currency: 'GBP',
            },
          ],
          chargesWithSuspendedPunishments: [
            {
              chargeNumber: 'MDI-000010',
              dateOfDiscovery: '2023-01-01',
              dateOfIncident: '2023-01-01',
              suspendedPunishments: [
                {
                  schedule: {
                    days: 10,
                    suspendedUntil: '2023-01-30',
                  },
                  type: PunishmentType.EXCLUSION_WORK,
                },
              ],
            },
          ],
          existingPunishments: [
            {
              schedule: {
                days: 10,
                endDate: '2023-01-15',
                startDate: '2023-01-05',
              },
              type: PunishmentType.EXCLUSION_WORK,
            },
          ],
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
