import { Express } from 'express'
import request from 'supertest'
import adjudicationUrls from '../../utils/urlGenerator'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'
import { PrisonerGender } from '../../data/DraftAdjudicationResult'

jest.mock('../../services/reportedAdjudicationsService')

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

describe('GET /your-completed-reports', () => {
  describe('with results', () => {
    beforeEach(() => {
      reportedAdjudicationsService.getYourCompletedAdjudications.mockResolvedValue({
        size: 10,
        number: 0,
        totalElements: 2,
        content: [
          {
            displayName: 'Smith, John',
            formattedDateTimeOfIncident: '15 November 2021 - 11:45',
            formattedDateTimeOfDiscovery: '15 November 2021 - 11:45',
            formattedDateTimeOfScheduledHearing: '',
            dateTimeOfIncident: '2021-11-15T11:45:00',
            dateTimeOfDiscovery: '2021-11-15T11:45:00',
            friendlyName: 'John Smith',
            adjudicationNumber: 2,
            prisonerNumber: 'G6123VU',
            gender: PrisonerGender.MALE,
            bookingId: 2,
            createdDateTime: '2021-11-15T11:45:00',
            createdByUserId: 'TEST_ER',
            reportingOfficer: '',
            incidentDetails: {
              locationId: 3,
              dateTimeOfIncident: '2021-11-15T11:45:00',
              handoverDeadline: '2021-11-17T11:45:00',
            },
            incidentStatement: {
              statement: 'My second incident',
            },
            incidentRole: {},
            offenceDetails: [{ offenceCode: 1001 }],
            status: ReportedAdjudicationStatus.AWAITING_REVIEW,
            statusDisplayName: 'Awaiting review',
            isYouthOffender: false,
          },
          {
            displayName: 'Moriarty, James',
            formattedDateTimeOfIncident: '15 November 2021 - 11:30',
            formattedDateTimeOfDiscovery: '15 November 2021 - 11:30',
            formattedDateTimeOfScheduledHearing: '',
            dateTimeOfIncident: '2021-11-15T11:30:00',
            dateTimeOfDiscovery: '2021-11-15T11:30:00',
            friendlyName: 'James Moriarty',
            adjudicationNumber: 1,
            createdByUserId: 'TEST_ER',
            reportingOfficer: '',
            prisonerNumber: 'G6174VU',
            gender: PrisonerGender.MALE,
            bookingId: 1,
            createdDateTime: '2021-11-15T11:30:00',
            incidentDetails: {
              locationId: 3,
              dateTimeOfIncident: '2021-11-15T11:30:00',
              handoverDeadline: '2021-11-17T11:30:00',
            },
            incidentStatement: {
              statement: 'My first incident',
            },
            incidentRole: {},
            offenceDetails: [{ offenceCode: 1001 }],
            status: ReportedAdjudicationStatus.ACCEPTED,
            statusDisplayName: 'Accepted',
            isYouthOffender: false,
          },
        ],
      })
    })

    it('should load the your completed reported page', () => {
      return request(app)
        .get(adjudicationUrls.yourCompletedReports.root)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Your completed reports')
          expect(res.text).toContain('Smith, John - G6123VU')
          expect(res.text).toContain('15 November 2021 - 11:45')
          expect(res.text).toContain('Awaiting review')
          expect(res.text).toContain('Moriarty, James - G6174VU')
          expect(res.text).toContain('15 November 2021 - 11:30')
          expect(res.text).toContain('Accepted')
        })
    })
  })

  describe('without results', () => {
    beforeEach(() => {
      reportedAdjudicationsService.getYourCompletedAdjudications.mockResolvedValue({
        size: 10,
        number: 0,
        totalElements: 2,
        content: [],
      })
    })

    it('should show the no results message', () => {
      return request(app)
        .get(adjudicationUrls.yourCompletedReports.root)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('There are no results for the details you have entered.')
        })
    })
  })
})

describe('POST /your-completed-reports', () => {
  it('should redirect with the correct filter parameters', () => {
    return request(app)
      .post(adjudicationUrls.yourCompletedReports.root)
      .send({ fromDate: { date: '01/01/2022' }, toDate: { date: '02/01/2022' }, status: 'AWAITING_REVIEW' })
      .expect(
        'Location',
        `${adjudicationUrls.yourCompletedReports.root}?fromDate=01%2F01%2F2022&toDate=02%2F01%2F2022&status=AWAITING_REVIEW`
      )
  })
})
