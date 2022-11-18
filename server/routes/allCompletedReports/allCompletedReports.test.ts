import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import UserService from '../../services/userService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import { ReportedAdjudicationStatus } from '../../data/ReportedAdjudicationResult'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/userService.ts')

const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const userService = new UserService(null) as jest.Mocked<UserService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, userService })

  const completedAdjudicationsContent = [
    {
      displayName: 'Smith, John',
      formattedDateTimeOfIncident: '15 November 2021 - 11:45',
      dateTimeOfIncident: '2021-11-15T11:45:00',
      friendlyName: 'John Smith',
      adjudicationNumber: 2,
      prisonerNumber: 'G6123VU',
      bookingId: 2,
      createdDateTime: '2021-11-15T11:45:00',
      createdByUserId: 'TEST_ER',
      reportingOfficer: 'Seamus Parkinson',
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
      dateTimeOfIncident: '2021-11-15T11:30:00',
      friendlyName: 'James Moriarty',
      adjudicationNumber: 1,
      createdByUserId: 'TEST_ER',
      reportingOfficer: 'Penelope Conroy',
      prisonerNumber: 'G6174VU',
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
      status: ReportedAdjudicationStatus.AWAITING_REVIEW,
      statusDisplayName: 'Awaiting review',
      isYouthOffender: false,
    },
  ]
  reportedAdjudicationsService.getAllCompletedAdjudications.mockResolvedValue({
    size: 20,
    number: 0,
    totalElements: 2,
    content: completedAdjudicationsContent,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /all-completed-reports', () => {
  it('should render the not found page without the correct role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .get(adjudicationUrls.allCompletedReports.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
  it('should render the correct page with the correct role', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])

    return request(app)
      .get(adjudicationUrls.allCompletedReports.root)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudications')
      })
  })
  it('should load the correct details', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    return request(app)
      .get(adjudicationUrls.allCompletedReports.root)
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Smith, John')
        expect(response.text).toContain('G6123VU')
        expect(response.text).toContain('15 November 2021 - 11:45')
        expect(response.text).toContain('Seamus Parkinson')
        expect(response.text).toContain('Awaiting review')
        expect(response.text).toContain('Moriarty, James')
        expect(response.text).toContain('G6174VU')
        expect(response.text).toContain('15 November 2021 - 11:30')
        expect(response.text).toContain('Penelope Conroy')
        expect(response.text).toContain('Awaiting review')
      })
  })
})

describe('POST /all-completed-reports', () => {
  it('should redirect with the correct filter parameters', () => {
    userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
    return request(app)
      .post(adjudicationUrls.allCompletedReports.root)
      .send({ fromDate: { date: '01/01/2022' }, toDate: { date: '02/01/2022' }, status: 'AWAITING_REVIEW' })
      .expect(
        'Location',
        `${adjudicationUrls.allCompletedReports.root}?fromDate=01%2F01%2F2022&toDate=02%2F01%2F2022&status=AWAITING_REVIEW`
      )
  })
  it('should render the not found page without the correct role', () => {
    userService.getUserRoles.mockResolvedValue([])
    return request(app)
      .post(adjudicationUrls.allCompletedReports.root)
      .expect(res => {
        expect(res.text).not.toContain('All completed reports')
      })
  })
})
