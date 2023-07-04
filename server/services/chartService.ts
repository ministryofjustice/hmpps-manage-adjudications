import HmppsAuthClient from '../data/hmppsAuthClient'
import { AgencyId } from '../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryHorizontalBar, HorizontalTableCell } from './ChartDetailsResult'
import DataInsightsApiClient from '../data/dataInsightsApiClient'
import DropDownEntry from '../routes/dataInsights/dropDownEntry'

export default class ChartService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getChart(
    username: string,
    agencyId: AgencyId,
    chartName: string,
    characteristic = ''
  ): Promise<ChartDetailsResult> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new DataInsightsApiClient(token).getDataInsightsChart(agencyId, chartName, characteristic)
  }
}

export const getUniqueItems = (chartEntries: ChartEntryHorizontalBar[], cell: HorizontalTableCell) =>
  Array.from(
    new Set(
      chartEntries.map((row: ChartEntryHorizontalBar) => {
        return cell.source(row) as string
      })
    )
  ).map(value => {
    return new DropDownEntry(value, value.toLowerCase().trim().replace(/\W+/g, '-'))
  })
