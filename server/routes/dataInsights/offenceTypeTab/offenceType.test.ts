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
      agencyId: '12345',
      data: { year: 2023 },
    })
  )
  app = appWithAllRoutes({ production: false }, { chartService })
})

afterEach(() => {
  jest.resetAllMocks()
  config.dataInsightsFlag = 'false'
})

describe('GET /data-insights/offence-type', () => {
  defaultConfig.dataInsightsFlag = 'true'

  it('should load the adjudication data', () => {
    return request(app)
      .get(adjudicationUrls.dataInsights.urls.offenceType())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudication data')
      })
  })
})