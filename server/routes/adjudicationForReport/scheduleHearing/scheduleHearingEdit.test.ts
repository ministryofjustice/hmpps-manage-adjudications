import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import { OicHearingType, ReportedAdjudicationStatus } from '../../../data/ReportedAdjudicationResult'
import LocationService from '../../../services/locationService'
import UserService from '../../../services/userService'
import TestData from '../../testutils/testData'

jest.mock('../../../services/locationService.ts')
jest.mock('../../../services/reportedAdjudicationsService.ts')
jest.mock('../../../services/userService.ts')

const testData = new TestData()
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
  reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G6415GD',
      firstName: 'JASON',
      lastName: 'SURCHET',
    })
  )
  locationService.getHearingLocations.mockResolvedValue(testData.residentialLocations())
  reportedAdjudicationsService.getReportedAdjudicationDetails.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber: 1524494,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2022-10-31T12:54:09.197Z',
      status: ReportedAdjudicationStatus.SCHEDULED,
      hearings: [
        testData.singleHearing({
          dateTimeOfHearing: '2022-11-03T11:00:00',
        }),
      ],
    }),
  })
  reportedAdjudicationsService.rescheduleHearing.mockResolvedValue({
    reportedAdjudication: testData.reportedAdjudication({
      adjudicationNumber: 1524494,
      prisonerNumber: 'G6415GD',
      dateTimeOfIncident: '2022-10-31T12:54:09.197Z',
      status: ReportedAdjudicationStatus.SCHEDULED,
      hearings: [
        testData.singleHearing({
          dateTimeOfHearing: '2022-11-04T10:00:00',
        }),
      ],
    }),
  })

  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService, locationService, userService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET reschedule a hearing', () => {
  it('should load the schedule hearing page', () => {
    return request(app)
      .get(adjudicationUrls.scheduleHearing.urls.edit(1524494, 101))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('Schedule a hearing')
        expect(locationService.getHearingLocations).toHaveBeenCalledTimes(1)
        expect(locationService.getHearingLocations).toHaveBeenCalledWith('MDI', expect.anything())
        expect(reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.getPrisonerDetailsFromAdjNumber).toHaveBeenCalledWith(
          1524494,
          expect.anything()
        )
      })
  })
})
describe('POST edit existing hearing', () => {
  it('should successfully submit a hearing when all details provided - GOV', () => {
    return request(app)
      .post(adjudicationUrls.scheduleHearing.urls.edit(1524494, 101))
      .send({
        hearingDate: { date: '04/11/2045', time: { hour: '10', minute: '00' } },
        locationId: 27008,
        hearingType: 'GOV',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(1524494))
      .expect(response => {
        expect(reportedAdjudicationsService.rescheduleHearing).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.rescheduleHearing).toHaveBeenCalledWith(
          1524494,
          101,
          27008,
          '2045-11-04T10:00',
          OicHearingType.GOV_ADULT as string,
          expect.anything()
        )
        expect(reportedAdjudicationsService.scheduleHearing).not.toHaveBeenCalled()
      })
  })
  it('should successfully submit a hearing when all details provided - IND_ADJ', () => {
    return request(app)
      .post(adjudicationUrls.scheduleHearing.urls.edit(1524494, 101))
      .send({
        hearingDate: { date: '04/11/2045', time: { hour: '10', minute: '00' } },
        locationId: 27008,
        hearingType: 'IND_ADJ',
      })
      .expect(302)
      .expect('Location', adjudicationUrls.hearingDetails.urls.review(1524494))
      .expect(response => {
        expect(reportedAdjudicationsService.rescheduleHearing).toHaveBeenCalledTimes(1)
        expect(reportedAdjudicationsService.rescheduleHearing).toHaveBeenCalledWith(
          1524494,
          101,
          27008,
          '2045-11-04T10:00',
          OicHearingType.INAD_ADULT as string,
          expect.anything()
        )
        expect(reportedAdjudicationsService.scheduleHearing).not.toHaveBeenCalled()
      })
  })
  it('should throw an error on api failure', () => {
    reportedAdjudicationsService.rescheduleHearing.mockRejectedValue(new Error('Internal Error'))
    return request(app)
      .post(adjudicationUrls.scheduleHearing.urls.edit(1524494, 101))
      .send({
        hearingDate: { date: '04/11/2045', time: { hour: '10', minute: '00' } },
        locationId: 27008,
        hearingType: 'GOV',
      })
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Error: Internal Error')
      })
  })
})
