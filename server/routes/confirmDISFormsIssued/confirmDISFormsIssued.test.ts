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
      chargeNumber: '12345',
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      prisonerNumber: 'G7234VB',
      otherData: {
        displayName: 'Smith, James',
      },
    }),
    testData.reportedAdjudication({
      chargeNumber: '12345',
      locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      prisonerNumber: 'G6123VU',
      otherData: {
        displayName: 'Tovey, Peter',
      },
    }),
  ]

  const locations = testData.residentialLocations()
  reportedAdjudicationsService.getAdjudicationDISFormData.mockResolvedValue(adjudicationResponse)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locationService.getLocationsForUser.mockResolvedValue(locations as any)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /issue-DIS1-2', () => {
  describe('with results', () => {
    it('should load confirm notice of being placed on report was issued page - no filter', () => {
      return request(app)
        .get(adjudicationUrls.confirmDISFormsIssued.root)
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Confirm notice of being placed on report was issued')
          expect(response.text).toContain('Smith, James - G7234VB')
          expect(response.text).toContain('Tovey, Peter - G6123VU')
          expect(reportedAdjudicationsService.getAdjudicationDISFormData).toBeCalledTimes(1)
          expect(reportedAdjudicationsService.filterAdjudicationsByLocation).toBeCalledTimes(0)
        })
    })
    it('should load confirm notice of being placed on report was issued page - with filter', () => {
      return request(app)
        .get(
          adjudicationUrls.confirmDISFormsIssued.urls.filter({
            fromDate: '04/12/2022',
            toDate: '06/12/2022',
            locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
          })
        )
        .expect('Content-Type', /html/)
        .expect(response => {
          expect(response.text).toContain('Confirm notice of being placed on report was issued')
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
          expect(response.text).toContain('Confirm notice of being placed on report was issued')
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
      .send({ fromDate: { date: '04/12/2022' }, toDate: { date: '06/12/2022' }, locationUuid: null })
      .expect(
        'Location',
        `${adjudicationUrls.confirmDISFormsIssued.root}?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationUuid=`
      )
  })
  it('should use correct filter parameters from form - with location', () => {
    return request(app)
      .post(adjudicationUrls.confirmDISFormsIssued.root)
      .send({
        fromDate: { date: '04/12/2022' },
        toDate: { date: '06/12/2022' },
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      })
      .expect(
        'Location',
        `${adjudicationUrls.confirmDISFormsIssued.root}?fromDate=04%2F12%2F2022&toDate=06%2F12%2F2022&locationUuid=0194ac90-2def-7c63-9f46-b3ccc911fdff`
      )
  })
  it('should cause validation error if toDate is before fromDate', () => {
    return request(app)
      .post(adjudicationUrls.confirmDISFormsIssued.root)
      .send({
        fromDate: { date: '06/12/2022' },
        toDate: { date: '04/12/2022' },
        locationUuid: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
      })
      .expect(res => {
        expect(res.text).toContain('Enter a date that is before or the same as the ‘date to’')
      })
  })
})
