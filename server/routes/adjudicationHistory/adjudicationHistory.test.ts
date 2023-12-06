import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../testutils/appSetup'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import TestData from '../testutils/testData'

jest.mock('../../services/reportedAdjudicationsService.ts')

const testData = new TestData()
const reportedAdjudicationsService = new ReportedAdjudicationsService(
  null,
  null,
  null,
  null
) as jest.Mocked<ReportedAdjudicationsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ production: false }, { reportedAdjudicationsService })

  reportedAdjudicationsService.getPrisonerDetails.mockResolvedValue(
    testData.prisonerResultSummary({
      offenderNo: 'G7234VB',
      firstName: 'James',
      lastName: 'Smith',
    })
  )
  reportedAdjudicationsService.getUniqueListOfAgenciesForPrisoner.mockResolvedValue([
    {
      agency: 'MDI',
      agencyDescription: 'Moorland (HMP)',
    },
    {
      agency: 'ATI',
      agencyDescription: 'Altcourse (HMP)',
    },
    {
      agency: 'BSI',
      agencyDescription: 'Brinsford (HMP)',
    },
  ])

  const adjudicationOne = testData.reportedAdjudication({
    chargeNumber: 'MDI-100001',
    prisonerNumber: 'G7234VB',
    dateTimeOfIncident: '2021-11-15T11:45:00',
    otherData: {
      displayName: 'Smith, James',
      formattedDateTimeOfIncident: '15 November 2021 - 11:45',
      formattedDateTimeOfDiscovery: '15 November 2021 - 11:45',
    },
  })
  const adjudicationTwo = testData.reportedAdjudication({
    chargeNumber: 'MDI-100000',
    prisonerNumber: 'G7234VB',
    dateTimeOfIncident: '2021-11-20T13:30:00',
    otherData: {
      displayName: 'Smith, James',
      formattedDateTimeOfIncident: '20 November 2021 - 13:30',
      formattedDateTimeOfDiscovery: '20 November 2021 - 13:30',
    },
  })
  reportedAdjudicationsService.getAdjudicationHistory.mockResolvedValue({
    size: 20,
    number: 0,
    totalElements: 2,
    content: [adjudicationOne, adjudicationTwo],
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /adjudication-history', () => {
  it('should load the correct details', () => {
    return request(app)
      .get(adjudicationUrls.adjudicationHistory.urls.start('G7234VB'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('James Smith’s adjudication history')
        expect(response.text).toContain('MDI-100001')
        expect(response.text).toContain('Awaiting review')
        expect(response.text).toContain('Date of discovery: 15/11/2021 - 11:45')
        expect(response.text).toContain('Happened at Moorland (HMP)')
        expect(response.text).toContain('MDI-100000')
        expect(response.text).toContain('Awaiting review')
        expect(response.text).toContain('Date of discovery: 20/11/2021 - 13:30')
        expect(response.text).toContain('Happened at Moorland (HMP)')
      })
  })
})

describe('POST /adjudication-history', () => {
  it('should redirect with the correct filter parameters', () => {
    return request(app)
      .post(adjudicationUrls.adjudicationHistory.urls.start('G7234VB'))
      .send({
        fromDate: '01/01/2021',
        toDate: '02/01/2021',
        status: 'AWAITING_REVIEW',
        agency: 'MDI',
      })
      .expect(
        'Location',
        `${adjudicationUrls.adjudicationHistory.urls.start(
          'G7234VB'
        )}?fromDate=01%2F01%2F2021&toDate=02%2F01%2F2021&status=AWAITING_REVIEW&agency=MDI`
      )
  })
})
