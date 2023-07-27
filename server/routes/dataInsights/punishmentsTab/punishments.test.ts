import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import config from '../../../config'
import ChartApiService from '../../../services/chartApiService'
import TestData from '../../testutils/testData'
import * as dataInsightsTabsOptions from '../dataInsightsTabsOptions'

jest.mock('../../../services/chartApiService.ts')

const testData = new TestData()
const chartApiService = new ChartApiService(null) as jest.Mocked<ChartApiService>

let app: Express
const defaultConfig = config

beforeEach(() => {
  jest.spyOn(dataInsightsTabsOptions, 'getActiveCaseLoadId').mockReturnValue('RNI')
  chartApiService.getChart.mockResolvedValue(
    testData.chartDetailsResult({
      agencyId: 'RNI',
      chartName: '4a',
      chartEntries: [],
    })
  )
  chartApiService.getChart.mockResolvedValue(
    testData.chartDetailsResult({
      agencyId: 'RNI',
      chartName: '4b',
      chartEntries: [],
    })
  )
  chartApiService.getChart.mockResolvedValue(
    testData.chartDetailsResult({
      agencyId: 'RNI',
      chartName: '4c',
      chartEntries: [],
    })
  )
  app = appWithAllRoutes({ production: false }, { chartApiService })
})

afterEach(() => {
  jest.resetAllMocks()
  config.dataInsightsFlag = 'false'
})

describe('GET /data-insights/punishments', () => {
  defaultConfig.dataInsightsFlag = 'true'

  it('should load the adjudication data', () => {
    return request(app)
      .get(adjudicationUrls.dataInsights.urls.punishments())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudication data')
      })
  })
})
