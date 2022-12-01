import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { OicHearingType, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import { PrisonerGender } from '../../../data/DraftAdjudicationResult'

jest.mock('../../../services/reportedAdjudicationsService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET hearing details', () => {
  it('should load the hearing details page - reporter version - no hearings', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValueOnce({
      reportedAdjudication: {
        adjudicationNumber: 1524493,
        prisonerNumber: 'G6415GD',
        gender: PrisonerGender.MALE,
        bookingId: 1,
        createdDateTime: undefined,
        createdByUserId: undefined,
        incidentDetails: {
          locationId: 197682,
          dateTimeOfIncident: '2021-12-09T10:30:00',
          handoverDeadline: '2021-12-11T10:30:00',
        },
        incidentStatement: undefined,
        incidentRole: {
          roleCode: undefined,
        },
        offenceDetails: [],
        status: ReportedAdjudicationStatus.AWAITING_REVIEW,
        isYouthOffender: false,
      },
    })
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.report(1524493))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('There are no hearings to schedule at the moment.')
        expect(response.text).toContain(
          'You can only schedule a hearing for reports that have been reviewed and accepted.'
        )
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledTimes(1)
      })
  })
  it('should load the hearing details page - reporter version - one hearing', () => {
    reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValueOnce({
      reportedAdjudication: {
        adjudicationNumber: 1524494,
        prisonerNumber: 'G6415GD',
        gender: PrisonerGender.MALE,
        bookingId: 1,
        createdDateTime: undefined,
        createdByUserId: undefined,
        incidentDetails: {
          locationId: 197682,
          dateTimeOfIncident: '2021-12-09T10:30:00',
          handoverDeadline: '2021-12-11T10:30:00',
        },
        incidentStatement: undefined,
        incidentRole: {
          roleCode: undefined,
        },
        offenceDetails: [],
        status: ReportedAdjudicationStatus.UNSCHEDULED,
        isYouthOffender: false,
        hearings: [
          {
            id: 101,
            locationId: 27008,
            dateTimeOfHearing: '2022-10-24T12:54:09.197Z',
            oicHearingType: OicHearingType.GOV_ADULT as string,
          },
        ],
      },
    })
    reportedAdjudicationsService.getHearingDetails.mockResolvedValue([
      {
        id: 101,
        dateTime: {
          label: 'Date and time of hearing',
          value: '24 October 2022 - 12:54',
        },
        location: {
          label: 'Location',
          value: 'Adj 2',
        },
      },
    ])
    return request(app)
      .get(adjudicationUrls.hearingDetails.urls.report(1524494))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getReportedAdjudicationDetails).toHaveBeenCalledWith(
          1524494,
          expect.anything()
        )
        expect(reportedAdjudicationsService.getPrisonerDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getHearingDetails).toHaveBeenCalledWith(
          [
            {
              id: 101,
              locationId: 27008,
              dateTimeOfHearing: '2022-10-24T12:54:09.197Z',
              oicHearingType: OicHearingType.GOV_ADULT as string,
            },
          ],
          expect.anything()
        )
        expect(response.text).toContain('Hearing 1')
      })
  })
})
