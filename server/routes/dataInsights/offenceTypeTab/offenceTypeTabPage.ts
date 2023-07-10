/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryHorizontalBar, ChartEntryLine } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { getUniqueItems, produceHorizontalBarsChart, produceLinesCharts } from '../chartService'
import adjudicationUrls from '../../../utils/urlGenerator'
import DropDownEntry from '../dropDownEntry'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

const getHorizontalBarsChartHeadByCharacteristic = () => {
  const head: { text: string; classes: string }[] = [
    {
      text: 'Location',
      classes: 'horizontal-chart-table-head-cell',
    },
    {
      text: 'Percentage',
      classes: 'horizontal-chart-table-head-cell',
    },
    {
      text: 'Number',
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
      'Total adjudications by adjudication offence type – current month and previous 12 months (3a)',
      await this.chartApiService.getChart(username, agencyId, '3a'),
      { source: (row: ChartEntryLine) => row.offence_type },
      { source: (row: ChartEntryHorizontalBar) => row.count }
    )

    const chartDetails3b = await this.chartApiService.getChart(username, agencyId, '3b')
    const chartEntries3b = chartDetails3b.chartEntries as ChartEntryHorizontalBar[]

    const offenceTypes: DropDownEntry[] = getUniqueItems(chartEntries3b, {
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
      'Adjudication offence type by location – last 30 days (3b)',
      chartDetails3b,
      { filter: (row: ChartEntryHorizontalBar) => row.offence_type === offenceType?.text },
      { source: (row: ChartEntryHorizontalBar) => row.incident_loc },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion_round * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.incident_loc}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion_round * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic()
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
