// eslint-disable-next-line max-classes-per-file
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryCommentary, ChartEntryHorizontalBar } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import {
  getTotalsAdjudicationsHorizontalBarsChartHead,
  produceCommentaryChart,
  produceHorizontalBarsChart,
  produceVerticalBarsAndLineCharts,
} from '../chartService'
import { getFullDate } from '../../../utils/utils'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

export default class TotalsAdjudicationsAndLocationsTabPage {
  pageOptions: PageOptions

  constructor(private readonly chartApiService: ChartApiService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    const { user } = res.locals
    const { username } = user
    const agencyId: AgencyId = user.activeCaseLoadId
    const lastModifiedDate = getFullDate(
      (await this.chartApiService.getLastModifiedChart(username, '1a')).lastModifiedDate.toString()
    )
    const chartSettingMap = {}

    chartSettingMap['1a'] = await produceVerticalBarsAndLineCharts(
      '1a',
      username,
      agencyId,
      'Adjudication reports created - over 24 months',
      'This is a high-level view of adjudication reports created over time. What do recent numbers tell you about prison stability? Are there any surprises or possible actions?',
      await this.chartApiService.getChart(username, agencyId, '1a'),
      'Number'
    )

    chartSettingMap['1b'] = await produceVerticalBarsAndLineCharts(
      '1b',
      username,
      agencyId,
      'Adjudication reports referred to independent adjudicator - over 24 months',
      'This chart shows adjudications which had at least 1 hearing with an independent adjudicator. Use it to explore any concerns you may have about numbers being referred to IAs. What do the numbers tell you about possible actions and future trends?',
      await this.chartApiService.getChart(username, agencyId, '1b'),
      'Number'
    )

    chartSettingMap['1c'] = await produceCommentaryChart(
      '1c',
      username,
      agencyId,
      'Number of people placed on report in the past 30 days',
      '',
      'This is approximately',
      'of your population over this period.',
      await this.chartApiService.getChart(username, agencyId, '1c'),
      {
        source: (row: ChartEntryHorizontalBar): ChartEntryCommentary => {
          return {
            data: row.count,
            proportion: `${Math.trunc(row.proportion * 100)}%`,
          } as ChartEntryCommentary
        },
      }
    )

    chartSettingMap['1d'] = await produceHorizontalBarsChart(
      '1d',
      username,
      agencyId,
      'Adjudication reports by location of adjudication incident - last 30 days',
      'Use this chart to see where recent rule-breaking took place. Are there any patterns or surprises? This can help inform actions around hotspots and possible interventions, for example staff awareness.',
      'Where more than 15 locations, only highest 15 are shown.',
      await this.chartApiService.getChart(username, agencyId, '1d'),
      { filter: () => true },
      { source: (row: ChartEntryHorizontalBar) => row.incident_loc },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => row.incident_loc },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getTotalsAdjudicationsHorizontalBarsChartHead(),
      'Percentage'
    )

    chartSettingMap['1f'] = await produceHorizontalBarsChart(
      '1f',
      username,
      agencyId,
      'Adjudication reports by residential location of prisoner - last 30 days',
      'Use this chart to explore where prisoners who broke the rules live. This may give you insights into the different residential populations, staff cultures, and could help inform keyworker priorities.',
      'Where more than 15 locations, only highest 15 are shown.',
      await this.chartApiService.getChart(username, agencyId, '1f'),
      { filter: () => true },
      { source: (row: ChartEntryHorizontalBar) => row.wing_loc },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => row.wing_loc },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getTotalsAdjudicationsHorizontalBarsChartHead(),
      'Percentage'
    )

    return res.render(`pages/dataInsights/totalsAdjudicationsAndLocationsTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.TOTALS_ADJUDICATIONS_AND_LOCATIONS),
      chartSettingMap,
      lastModifiedDate,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }
}
