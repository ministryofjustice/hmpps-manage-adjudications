import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import adjudicationUrls from '../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import LocationService from '../../services/locationService'
import TestData from '../testutils/testData'
import { allIssueStatuses, IssueStatus } from '../../data/ReportedAdjudicationResult'

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
    testData.reportedAdjudication({
      adjudicationNumber: 12345,
      prisonerNumber: 'G7234VB',
      otherData: {
        displayName: 'Smith, James',
      },
    }),
    testData.reportedAdjudication({
      adjudicationNumber: 23456,
      prisonerNumber: 'G6123VU',
      otherData: {
        displayName: 'Tovey, Peter',
      },
    }),
  ]

  const locations = testData.residentialLocations()
  reportedAdjudicationsService.getAdjudicationDISFormData.mockResolvedValue(adjudicationResponse)
  locationService.getLocationsForUser.mockResolvedValue(locations)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /print-completed-DIS-forms', () => {
  describe('with results', () => {
    it('should load the page with no filter', () => {
      return request(app)
        .get(adjudicationUrls.printCompletedDisForms.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Print completed DIS 1/2 forms')
          expect(response.text).toContain('Smith, James - G7234VB')
          expect(response.text).toContain('Tovey, Peter - G6123VU')
          expect(reportedAdjudicationsService.getAdjudicationDISFormData).toBeCalledTimes(1)
          expect(reportedAdjudicationsService.filterAdjudicationsByLocation).toBeCalledTimes(0)
        })
    })
    it('should load the page with filter', () => {
      return request(app)
        .get(
          adjudicationUrls.printCompletedDisForms.urls.filter({
            fromDate: '06/12/2022',
            toDate: '07/12/2022',
            locationId: '25655',
            issueStatus: allIssueStatuses,
          })
        )
        .expect('Content-Type', /html/)
        .expect(response => {
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
        .get(adjudicationUrls.printCompletedDisForms.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Print completed DIS 1/2 forms')
          expect(response.text).toContain('No scheduled hearings.')
          expect(reportedAdjudicationsService.getAdjudicationDISFormData).toBeCalledTimes(1)
          expect(reportedAdjudicationsService.filterAdjudicationsByLocation).toBeCalledTimes(0)
        })
    })
  })
})

describe('POST /issue-DIS1-2', () => {
  it('should use correct filter parameters from form - without location', () => {
    return request(app)
      .post(adjudicationUrls.printCompletedDisForms.root)
      .send({
        fromDate: { date: '04/12/2022' },
        toDate: { date: '06/12/2022' },
        locationId: null,
        issueStatus: allIssueStatuses,
      })
      .expect(
        'Location',
        `${adjudicationUrls.printCompletedDisForms.root}?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationId=&issueStatus=ISSUED&issueStatus=NOT_ISSUED`
      )
  })
  it('should use correct filter parameters from form - with location', () => {
    return request(app)
      .post(adjudicationUrls.printCompletedDisForms.root)
      .send({
        fromDate: { date: '04/12/2022' },
        toDate: { date: '06/12/2022' },
        locationId: 722174,
        issueStatus: allIssueStatuses,
      })
      .expect(
        'Location',
        `${adjudicationUrls.printCompletedDisForms.root}?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationId=722174&issueStatus=ISSUED&issueStatus=NOT_ISSUED`
      )
  })
  it('should use correct filter parameters from form - with just ISSUED', () => {
    return request(app)
      .post(adjudicationUrls.printCompletedDisForms.root)
      .send({
        fromDate: { date: '04/12/2022' },
        toDate: { date: '06/12/2022' },
        locationId: 722174,
        issueStatus: IssueStatus.ISSUED,
      })
      .expect(
        'Location',
        `${adjudicationUrls.printCompletedDisForms.root}?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationId=722174&issueStatus=ISSUED`
      )
  })
  it('should use correct filter parameters from form - with just NOT_ISSUED', () => {
    return request(app)
      .post(adjudicationUrls.printCompletedDisForms.root)
      .send({
        fromDate: { date: '04/12/2022' },
        toDate: { date: '06/12/2022' },
        locationId: 722174,
        issueStatus: IssueStatus.NOT_ISSUED,
      })
      .expect(
        'Location',
        `${adjudicationUrls.printCompletedDisForms.root}?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationId=722174&issueStatus=NOT_ISSUED`
      )
  })
  it('should cause validation error if toDate is before fromDate', () => {
    return request(app)
      .post(adjudicationUrls.printCompletedDisForms.root)
      .send({
        fromDate: { date: '06/12/2022' },
        toDate: { date: '04/12/2022' },
        locationId: 722174,
        issueStatus: allIssueStatuses,
      })
      .expect(res => {
        expect(res.text).toContain('Enter a date that is before or the same as the ‘date to’')
      })
  })
})
