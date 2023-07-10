/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryHorizontalBar, ChartEntryLine } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { produceLinesCharts } from '../chartService'

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
      'Pleas given – current month and previous 12 months (5a)',
      await this.chartApiService.getChart(username, agencyId, '5a'),
      { source: (row: ChartEntryLine) => row.plea },
      { source: (row: ChartEntryHorizontalBar) => row.count }
    )

    chartSettingMap['5b'] = await produceLinesCharts(
      '5b',
      username,
      agencyId,
      'Total adjudications by findings – current month and previous 12 months (5b)',
      await this.chartApiService.getChart(username, agencyId, '5b'),
      { source: (row: ChartEntryLine) => row.finding },
      { source: (row: ChartEntryHorizontalBar) => row.count }
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
