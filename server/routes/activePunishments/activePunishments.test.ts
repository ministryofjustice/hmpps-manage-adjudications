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
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /active-punishments', () => {
  it('should load the correct details', () => {
    return request(app)
      .get(adjudicationUrls.activePunishments.urls.start('G7234VB'))
      .expect('Content-Type', /html/)
      .expect(response => {
        expect(response.text).toContain('James Smith’s active punishments')
      })
  })
})
