import config from '../config'
import RestClient from './restClient'
import { AgencyId } from './PrisonLocationResult'

import { ChartDetailsResult, ChartLastUpdatedResult } from '../services/ChartDetailsResult'

export default class DataInsightsApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Data Insights API', config.apis.dataInsights, token)
  }

  async getDataInsightsChart(agencyId: AgencyId, chartName: string): Promise<ChartDetailsResult> {
    return this.restClient.get({
      path: `/api/data-insights/chart/${agencyId}/${chartName}`,
    })
  }

  async getLastModifiedDate(chartName: string): Promise<ChartLastUpdatedResult> {
    return this.restClient.get({
      path: `/api/data-insights/chart/last-updated/${chartName}`,
    })
  }
}
