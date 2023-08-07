import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from '../../testutils/appSetup'
import adjudicationUrls from '../../../utils/urlGenerator'
import ChartApiService from '../../../services/chartApiService'
import TestData from '../../testutils/testData'

jest.mock('../../../services/chartApiService.ts')

const testData = new TestData()
const chartApiService = new ChartApiService(null) as jest.Mocked<ChartApiService>

let app: Express

beforeEach(() => {
  chartApiService.getChart.mockResolvedValue(
    testData.chartDetailsResult({
      agencyId: 'RNI',
      chartName: '2a',
      chartEntries: [],
    })
  )
  chartApiService.getChart.mockResolvedValue(
    testData.chartDetailsResult({
      agencyId: 'RNI',
      chartName: '2b',
      chartEntries: [],
    })
  )
  app = appWithAllRoutes({ production: false }, { chartApiService })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /data-insights/protected-and-responsivity-characteristics', () => {
  it('should load the adjudication data', () => {
    return request(app)
      .get(adjudicationUrls.dataInsights.urls.protectedAndResponsivityCharacteristics())
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Adjudication data')
      })
  })
})
