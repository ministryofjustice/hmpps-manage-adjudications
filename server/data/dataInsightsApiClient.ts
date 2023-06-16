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

  async getDataInsightsChart(agencyId: AgencyId): Promise<ChartDetailsResult> {
    try {
      return this.restClient.get({
        path: `/api/data-insights/chart/${agencyId}`,
      })
    } catch (e) {
      return new Promise(resolve => {
        resolve({
          agencyId,
          data: {
            year: 2011,
          },
        })
      })
    }
  }
}
