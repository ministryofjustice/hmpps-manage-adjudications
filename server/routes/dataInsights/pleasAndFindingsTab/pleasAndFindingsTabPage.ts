/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import {
  ALL_DATA_FILTER,
  ChartDetailsResult,
  ChartEntryDuoLine,
  ChartEntryHorizontalBar,
  ChartEntryLine,
} from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { produceDuoVerticalBarsCharts, produceLinesCharts } from '../chartService'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

export default class PleasAndFindingsTabPage {
  pageOptions: PageOptions

  constructor(private readonly chartApiService: ChartApiService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    const { user } = res.locals
    const { username } = user
    const agencyId: AgencyId = user.activeCaseLoadId

    const chartSettingMap = {}

    chartSettingMap['5a'] = await produceLinesCharts(
      '5a',
      username,
      agencyId,
      'Pleas given - current month and previous 12 months',
      'This chart shows the numbers of each plea given over time. Are there any insights or trends which can inform any actions?',
      await this.chartApiService.getChart(username, agencyId, '5a'),
      ALL_DATA_FILTER,
      { source: (row: ChartEntryLine) => row.plea },
      { source: (row: ChartEntryHorizontalBar) => row.count }
    )

    chartSettingMap['5b'] = await produceLinesCharts(
      '5b',
      username,
      agencyId,
      'Findings - current month and previous 12 months',
      'This chart shows the numbers of each finding over time. Are there any insights or trends which can inform any actions?',
      await this.chartApiService.getChart(username, agencyId, '5b'),
      ALL_DATA_FILTER,
      { source: (row: ChartEntryLine) => row.finding },
      { source: (row: ChartEntryHorizontalBar) => row.count }
    )

    chartSettingMap['5c'] = await produceDuoVerticalBarsCharts(
      '5c',
      username,
      agencyId,
      'Adjudications resolved with more than one hearing - current month and previous 12 months',
      'Use this chart to understand and monitor how many adjudications are adjourned after first hearing. Are these levels as low as you would want, suggesting it only happens when warranted?',
      await this.chartApiService.getChart(username, agencyId, '5c'),
      [
        {
          label: '1 hearing',
          countSource: { source: (row: ChartEntryDuoLine) => row.count_one },
          propSource: { source: (row: ChartEntryDuoLine) => row.prop_one },
        },
        {
          label: 'More than 1 hearing',
          countSource: { source: (row: ChartEntryDuoLine) => row.count_more },
          propSource: { source: (row: ChartEntryDuoLine) => row.prop_more },
        },
      ],
      { source: (row: ChartEntryLine) => Math.trunc(row.proportion * 100) },
      { source: (row: ChartEntryDuoLine) => `${row.year}-${row.month}` },
      { source: (row: ChartEntryDuoLine) => row.count }
    )

    return res.render(`pages/dataInsights/pleasAndFindingsTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PLEAS_AND_FINDINGS),
      chartSettingMap,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }
}
