// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartService from '../../../services/chartService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryHorizontalBar } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { produceHorizontalBarsChart, produceVerticalBarsAndLineCharts } from '../chartService'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

export default class TotalsAdjudicationsAndLocationsTabPage {
  pageOptions: PageOptions

  constructor(private readonly chartService: ChartService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    const { user } = res.locals
    const { username } = user
    const agencyId: AgencyId = user.activeCaseLoadId

    const chartSettingMap = {}

    chartSettingMap['1a'] = await produceVerticalBarsAndLineCharts(
      '1a',
      username,
      agencyId,
      'Total adjudications - over 24 months (1a)',
      await this.chartService.getChart(username, agencyId, '1a')
    )

    chartSettingMap['1b'] = await produceVerticalBarsAndLineCharts(
      '1b',
      username,
      agencyId,
      'Total adjudications referred to independent adjudicator - over 24 months (1b)',
      await this.chartService.getChart(username, agencyId, '1b')
    )

    chartSettingMap['1d'] = await produceHorizontalBarsChart(
      '1d',
      username,
      agencyId,
      'Total adjudications by location of adjudication offence – last 30 days (1d)',
      await this.chartService.getChart(username, agencyId, '1d'),
      { source: (row: ChartEntryHorizontalBar) => row.incident_loc },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion_round * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => row.incident_loc },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion_round * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ]
    )

    chartSettingMap['1f'] = await produceHorizontalBarsChart(
      '1f',
      username,
      agencyId,
      'Total adjudications by residential location of offender – last 30 days (1f)',
      await this.chartService.getChart(username, agencyId, '1f'),
      { source: (row: ChartEntryHorizontalBar) => row.wing_loc },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion_round * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => row.wing_loc },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion_round * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ]
    )

    return res.render(`pages/dataInsights/totalsAdjudicationsAndLocationsTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.TOTALS_ADJUDICATIONS_AND_LOCATIONS),
      chartSettingMap,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }
}
