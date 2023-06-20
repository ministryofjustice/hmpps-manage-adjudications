import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import config from '../../../config'
import ChartService from '../../../services/chartService'
import TestData from '../../testutils/testData'

jest.mock('../../../services/chartService.ts')

const testData = new TestData()
const chartService = new ChartService(null) as jest.Mocked<ChartService>

let app: Express
const defaultConfig = config

beforeEach(() => {
  chartService.getChart.mockResolvedValue(
    testData.chartDetailsResult({
      agencyId: 'MDI',
      chartEntries: [],
    })
  )
  app = appWithAllRoutes({ production: false }, { chartService })
})

afterEach(() => {
  jest.resetAllMocks()
  config.dataInsightsFlag = 'false'
})

describe('GET /data-insights/totals-adjudications-and-locations', () => {
  defaultConfig.dataInsightsFlag = 'true'

  it('should load the adjudication data', () => {
    return request(app)
      .get(adjudicationUrls.dataInsights.urls.totalsAdjudicationsAndLocations())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudication data')
      })
  })
})
