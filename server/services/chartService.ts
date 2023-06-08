/* eslint-disable no-console */
import HmppsAuthClient, { User } from '../data/hmppsAuthClient'
import { AgencyId, LocationId } from '../data/PrisonLocationResult'
import { ChartDetailsResult } from './ChartDetailsResult'
import DataInsightsApiClient from '../data/dataInsightsApiClient'

export default class ChartService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getChart(locationId: LocationId, user: User, agencyId: AgencyId): Promise<ChartDetailsResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(user.username)
    return new DataInsightsApiClient(token).getDataInsightsChart(agencyId)
  }
}
