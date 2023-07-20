/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import {
  ChartDetailsResult,
  ChartEntryHorizontalBar,
  ChartEntryLine,
  ALL_DATA_FILTER,
} from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { getUniqueItems, produceHorizontalBarsChart, produceLinesCharts } from '../chartService'
import adjudicationUrls from '../../../utils/urlGenerator'
import DropDownEntry from '../dropDownEntry'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

const getOffenceTypeHorizontalBarsChartHead = () => {
  const head: { text: string; classes: string }[] = [
    {
      text: 'Location',
      classes: 'horizontal-chart-table-head-cell horizontal-chart-table-head-cell-width-auto',
    },
    {
      text: 'Percentage of offences',
      classes: 'horizontal-chart-table-head-cell',
    },
    {
      text: 'Number of offences',
      classes: 'horizontal-chart-table-head-cell',
    },
  ]
  return head
}

export default class OffenceTypeTabPage {
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

    chartSettingMap['3a'] = await produceLinesCharts(
      '3a',
      username,
      agencyId,
      'Total adjudications by adjudication offence type - current month and previous 12 months (3a)',
      'This chart shows the frequency of the different offence types leading to an adjudication. Are there any insights or trends which can inform any actions?',
      await this.chartApiService.getChart(username, agencyId, '3a'),
      ALL_DATA_FILTER,
      { source: (row: ChartEntryLine) => row.offence_type },
      { source: (row: ChartEntryHorizontalBar) => row.count }
    )

    const chartDetails3b = await this.chartApiService.getChart(username, agencyId, '3b')
    const offenceTypes: DropDownEntry[] = getUniqueItems(chartDetails3b.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.offence_type,
    })
    const offenceType: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      offenceTypes,
      req.query['offence-type'] as string,
      offenceTypes.length > 0 ? offenceTypes[0] : undefined
    )

    chartSettingMap['3b'] = await produceHorizontalBarsChart(
      '3b',
      username,
      agencyId,
      'Adjudication offence type by location - last 30 days (3b)',
      'Select an offence type to see where offences took place. Are there any patterns or surprises? This can help inform actions around hotspots and possible interventions, for example staff awareness.',
      chartDetails3b,
      { filter: (row: ChartEntryHorizontalBar) => row.offence_type === offenceType?.text },
      { source: (row: ChartEntryHorizontalBar) => row.incident_loc },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.incident_loc}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getOffenceTypeHorizontalBarsChartHead()
    )

    return res.render(`pages/dataInsights/offenceTypeTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.OFFENCE_TYPE),
      chartSettingMap,
      offenceTypes,
      offenceType: offenceType?.value,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { offenceType } = req.body
    return res.redirect(adjudicationUrls.dataInsights.urls.offenceType(offenceType))
  }
}
