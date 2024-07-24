/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import {
  ALL_DATA_FILTER,
  ChartDetailsResult,
  ChartEntryHorizontalBar,
  ChartEntryLine,
} from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { produceLinesCharts } from '../chartService'
import { getFullDate } from '../../../utils/utils'

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
    const agencyId: AgencyId = user.meta.caseLoadId

    const chartSettingMap = {} as Record<string, any>
    const lastModifiedDate = getFullDate(
      (await this.chartApiService.getLastModifiedChart(username, '5a')).lastModifiedDate
    )

    chartSettingMap['5a'] = await produceLinesCharts(
      '5a',
      username,
      agencyId,
      'Hearing pleas given - current month and previous 12 months',
      'This chart shows the numbers of each plea given over time. Are there any insights or trends which can inform any actions?',
      await this.chartApiService.getChart(username, agencyId, '5a'),
      ALL_DATA_FILTER,
      { source: (row: ChartEntryLine) => row.plea },
      { source: (row: ChartEntryHorizontalBar) => row.count },
      'Count'
    )

    chartSettingMap['5b'] = await produceLinesCharts(
      '5b',
      username,
      agencyId,
      'Hearing findings - current month and previous 12 months',
      'This chart shows the numbers of each recorded finding over time. Are there any insights or trends which can inform any actions?',
      await this.chartApiService.getChart(username, agencyId, '5b'),
      ALL_DATA_FILTER,
      { source: (row: ChartEntryLine) => row.finding },
      { source: (row: ChartEntryHorizontalBar) => row.count },
      'Count'
    )

    return res.render(`pages/dataInsights/pleasAndFindingsTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PLEAS_AND_FINDINGS),
      chartSettingMap,
      lastModifiedDate,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }
}
