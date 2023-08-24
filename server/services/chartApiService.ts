import HmppsAuthClient from '../data/hmppsAuthClient'
import { AgencyId } from '../data/PrisonLocationResult'
import { ChartDetailsResult, ChartLastUpdatedResult } from './ChartDetailsResult'
import DataInsightsApiClient from '../data/dataInsightsApiClient'

export default class ChartApiService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getChart(username: string, agencyId: AgencyId, chartName: string): Promise<ChartDetailsResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new DataInsightsApiClient(token).getDataInsightsChart(agencyId, chartName)
  }

  async getLastModifiedChart(username: string, chartName: string): Promise<ChartLastUpdatedResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new DataInsightsApiClient(token).getLastModifiedDate(chartName)
  }
}
