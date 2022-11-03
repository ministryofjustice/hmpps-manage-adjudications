import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'

jest.mock('../../../services/locationService.ts')
jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/userService.ts')

const locationService = new LocationService(null) as jest.Mocked<LocationService>
const userService = new UserService(null) as jest.Mocked<UserService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  userService.getUserRoles.mockResolvedValue(['ADJUDICATIONS_REVIEWER'])
  reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber.mockResolvedValue({
    offenderNo: 'G6415GD',
    firstName: 'JASON',
    lastName: 'SURCHET',
    assignedLivingUnit: {
      agencyId: 'MDI',
      locationId: 25573,
      description: '1-1-035',
      agencyName: 'Moorland (HMP & YOI)',
    },
    categoryCode: 'C',
    language: 'Welsh',
    dateOfBirth: '1990-10-12',
    friendlyName: 'Jason Surchet',
    displayName: 'Surchet, Jason',
    prisonerNumber: 'G6415GD',
    currentLocation: '1-1-035',
  })
  locationService.getIncidentLocations.mockResolvedValue([
    { locationId: 27008, locationPrefix: 'A1', userDescription: 'Adj 1' },
    { locationId: 27009, locationPrefix: 'A2', userDescription: 'Adj 2' },
    { locationId: 27010, locationPrefix: 'A3', userDescription: 'Adj 3' },
    { locationId: 27011, locationPrefix: 'A4', userDescription: 'Adj 4' },
  ])
  reportedAdjudicationsService.scheduleHearing.mockResolvedValue({
    reportedAdjudication: {
      adjudicationNumber: 1524494,
      prisonerNumber: 'G6415GD',
      bookingId: 1,
      createdDateTime: undefined,
      createdByUserId: undefined,
      incidentDetails: {
        locationId: 197682,
        dateTimeOfIncident: '2022-10-31T12:54:09.197Z',
        handoverDeadline: '2022-11-02T12:54:09.197Z',
      },
      incidentStatement: undefined,
      incidentRole: {
        roleCode: undefined,
      },
      offenceDetails: [],
      status: ReportedAdjudicationStatus.ACCEPTED,
      isYouthOffender: false,
      hearings: [
        {
          id: 101,
          locationId: 27008,
          dateTimeOfHearing: '2022-11-03T11:00:00',
        },
      ],
    },
  })
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, locationService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET schedule a hearing', () => {
  it('should load the schedule hearing page', () => {
    return request(app)
      .get(adjudicationUrls.scheduleHearing.urls.start(1524494))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Schedule a hearing')
        expect(locationService.getIncidentLocations).toHaveBeenCalledTimes(1)
        expect(locationService.getIncidentLocations).toHaveBeenCalledWith('MDI', expect.anything())
        expect(reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber).toHaveBeenCalledWith(
          1524494,
          expect.anything()
        )
      })
  })
})
describe('POST new schedule hearing', () => {
  it('should successfully submit a hearing when all details provided', () => {
    return request(app)
      .post(adjudicationUrls.scheduleHearing.urls.start(1524494))
      .send({
        hearingDate: { date: '03/11/2045', time: { hour: '11', minute: '00' } },
        locationId: 27008,
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(1524494))
      .expect(response => {
        expect(reportedAdjudicationsService.scheduleHearing).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.scheduleHearing).toHaveBeenCalledWith(
          1524494,
          27008,
          '2045-11-03T11:00',
          expect.anything()
        )
        expect(reportedAdjudicationsService.rescheduleHearing).not.toHaveBeenCalled()
      })
  })
  it('should throw an error on api failure', () => {
    reportedAdjudicationsService.scheduleHearing.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(adjudicationUrls.scheduleHearing.urls.start(1524494))
      .send({
        hearingDate: { date: '03/11/2045', time: { hour: '11', minute: '00' } },
        locationId: 27008,
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
})
