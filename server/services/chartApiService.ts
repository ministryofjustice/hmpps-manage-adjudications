import HmppsAuthClient from '../data/hmppsAuthClient'
import { AgencyId } from '../data/PrisonLocationResult'
import { ChartDetailsResult } from './ChartDetailsResult'
import DataInsightsApiClient from '../data/dataInsightsApiClient'

export default class ChartApiService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getChart(username: string, agencyId: AgencyId, chartName: string): Promise<ChartDetailsResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new DataInsightsApiClient(token).getDataInsightsChart(agencyId, chartName)
  }
}
