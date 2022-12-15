import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import TestData from '../testutils/testData'

jest.mock('../../services/reportedAdjudicationsService.ts')
jest.mock('../../services/locationService.ts')

const locationService = new LocationService(null) as jest.Mocked<LocationService>
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>
const testData = new TestData() as jest.Mocked<TestData>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { locationService, reportedAdjudicationsService })

  const adjudicationResponse = [
    testData.completedAdjudication(12345, 'G7234VB', {
      displayName: 'Smith, James',
      friendlyName: 'James Smith',
      issuingOfficer: 'JPERALTER',
      prisonerLocation: 'MDI-2-3-009',
      formattedDateTimeOfDiscovery: '5 December 2022 - 11:11',
      dateTimeOfDiscovery: '2022-12-05T11:11:00',
      dateTimeOfIssue: '2022-12-05T15:00:00',
      formattedDateTimeOfIssue: '5 December 2022 - 15:00',
      formsAlreadyIssued: true,
    }),
    testData.completedAdjudication(23456, 'G6123VU', {
      displayName: 'Tovey, Peter',
      friendlyName: 'Peter Tovey',
      issuingOfficer: 'JPERALTER',
      prisonerLocation: 'MDI-RECP',
      formattedDateTimeOfDiscovery: '6 December 2022 - 12:10',
      dateTimeOfDiscovery: '2022-12-06T12:10:00',
      formattedDateTimeOfIssue: '6 December 2022 - 16:30',
      formsAlreadyIssued: true,
      dateTimeOfIssue: '2022-12-06T16:30:00',
    }),
  ]

  const locations = testData.residentialLocations()
  reportedAdjudicationsService.getAdjudicationDISFormData.mockResolvedValue(adjudicationResponse)
  locationService.getLocationsForUser.mockResolvedValue(locations)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /issue-DIS1-2', () => {
  describe('with results', () => {
    it('should load confirm DIS 1/2 has been issued to prisoner page - no filter', () => {
      return request(app)
        .get(adjudicationUrls.confirmDISFormsIssued.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Confirm DIS 1/2 has been issued to prisoner')
          expect(response.text).toContain('Smith, James - G7234VB')
          expect(response.text).toContain('Tovey, Peter - G6123VU')
          expect(reportedAdjudicationsService.getAdjudicationDISFormData).toBeCalledTimes(1)
          expect(reportedAdjudicationsService.filterAdjudicationsByLocation).toBeCalledTimes(0)
        })
    })
    it('should load confirm DIS 1/2 has been issued to prisoner page - with filter', () => {
      return request(app)
        .get(
          adjudicationUrls.confirmDISFormsIssued.urls.filter({
            fromDate: '04/12/2022',
            toDate: '06/12/2022',
            locationId: '722174',
          })
        )
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Confirm DIS 1/2 has been issued to prisoner')
          expect(reportedAdjudicationsService.getAdjudicationDISFormData).toBeCalledTimes(1)
          expect(reportedAdjudicationsService.filterAdjudicationsByLocation).toBeCalledTimes(1)
        })
    })
  })
  describe('without results', () => {
    beforeEach(() => {
      reportedAdjudicationsService.getAdjudicationDISFormData.mockResolvedValue([])
    })
    it('shows default message', () => {
      return request(app)
        .get(adjudicationUrls.confirmDISFormsIssued.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Confirm DIS 1/2 has been issued to prisoner')
          expect(response.text).toContain('No completed reports')
          expect(reportedAdjudicationsService.getAdjudicationDISFormData).toBeCalledTimes(1)
          expect(reportedAdjudicationsService.filterAdjudicationsByLocation).toBeCalledTimes(0)
        })
    })
  })
})

describe('POST /issue-DIS1-2', () => {
  it('should use correct filter parameters from form - without location', () => {
    return request(app)
      .post(adjudicationUrls.confirmDISFormsIssued.root)
      .send({ fromDate: { date: '04/12/2022' }, toDate: { date: '06/12/2022' }, locationId: null })
      .expect(
        'Location',
        `${adjudicationUrls.confirmDISFormsIssued.root}?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationId=`
      )
  })
  it('should use correct filter parameters from form - with location', () => {
    return request(app)
      .post(adjudicationUrls.confirmDISFormsIssued.root)
      .send({ fromDate: { date: '04/12/2022' }, toDate: { date: '06/12/2022' }, locationId: 722174 })
      .expect(
        'Location',
        `${adjudicationUrls.confirmDISFormsIssued.root}?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationId=722174`
      )
  })
  it('should cause validation error if toDate is before fromDate', () => {
    return request(app)
      .post(adjudicationUrls.confirmDISFormsIssued.root)
      .send({ fromDate: { date: '06/12/2022' }, toDate: { date: '04/12/2022' }, locationId: 722174 })
      .expect(res => {
        expect(res.text).toContain('Enter a date that is before or the same as the ‘date to’')
      })
  })
})
