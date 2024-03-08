import { Express } from 'express'
import request from 'supertest'
import adjudicationUrls from '../../utils/urlGenerator'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import TestData from '../testutils/testData'

jest.mock('../../services/reportedAdjudicationsService')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
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
      const adjudicationOne = testData.reportedAdjudication({
        chargeNumber: '2',
        prisonerNumber: 'G6123VU',
        dateTimeOfIncident: '2021-11-15T11:45:00',
        otherData: {
          friendlyName: 'John Smith',
          formattedDateTimeOfIncident: '15 November 2021 - 11:45',
          formattedDateTimeOfDiscovery: '15 November 2021 - 11:45',
          isReporterVersion: true,
        },
      })
      const adjudicationTwo = testData.reportedAdjudication({
        chargeNumber: '1',
        prisonerNumber: 'G6174VU',
        dateTimeOfIncident: '2021-11-15T11:30:00',
        otherData: {
          friendlyName: 'James Moriarty',
          formattedDateTimeOfIncident: '15 November 2021 - 11:30',
          formattedDateTimeOfDiscovery: '15 November 2021 - 11:30',
          isReporterVersion: true,
        },
      })
      reportedAdjudicationsService.getYourCompletedAdjudications.mockResolvedValue({
        size: 10,
        number: 0,
        totalElements: 2,
        content: [adjudicationOne, adjudicationTwo],
      })
    })

    it('should load the your completed reported page', () => {
      return request(app)
        .get(adjudicationUrls.yourCompletedReports.root)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('Your completed reports')
          expect(res.text).toContain('John Smith - G6123VU')
          expect(res.text).toContain('Date of discovery: 15/11/2021 - 11:45')
          expect(res.text).toContain('James Moriarty - G6174VU')
          expect(res.text).toContain('Date of discovery: 15/11/2021 - 11:30')
        })
    })
  })

  describe('without results', () => {
    beforeEach(() => {
      reportedAdjudicationsService.getYourCompletedAdjudications.mockResolvedValue({
        size: 10,
        number: 0,
        totalElements: 0,
        content: [],
      })
    })

    it('should show the no results message', () => {
      return request(app)
        .get(adjudicationUrls.yourCompletedReports.root)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).toContain('No adjudications have been found for the selected filters.')
        })
    })
  })
})

describe('POST /your-completed-reports', () => {
  it('should redirect with the correct filter parameters', () => {
    return request(app)
      .post(adjudicationUrls.yourCompletedReports.root)
      .send({
        fromDate: { date: '01/01/2021' },
        toDate: { date: '02/01/2021' },
        status: 'AWAITING_REVIEW',
      })
      .expect(
        'Location',
        `${adjudicationUrls.yourCompletedReports.root}?fromDate=01%2F01%2F2021&toDate=02%2F01%2F2021&status=AWAITING_REVIEW`
      )
  })
})
