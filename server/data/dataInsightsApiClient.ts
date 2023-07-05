// eslint-disable-next-line import/no-cycle
import config from '../config'
import RestClient from './restClient'
import { AgencyId } from './PrisonLocationResult'

import { ChartDetailsResult } from '../services/ChartDetailsResult'

export default class DataInsightsApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Data Insights API', config.apis.dataInsights, token)
  }

  async getDataInsightsChart(
    agencyId: AgencyId,
    chartName: string,
    characteristic: string
  ): Promise<ChartDetailsResult> {
    const queryParams = characteristic ? `?characteristic=${characteristic}` : ''
    return this.restClient.get({
      path: `/api/data-insights/chart/${agencyId}/${chartName}${queryParams}`,
    })
  }
}
