/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartService, { getUniqueItems } from '../../../services/chartService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryHorizontalBar } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { produceHorizontalBarsChart } from '../chartService'
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

  constructor(private readonly chartService: ChartService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    const { user } = res.locals
    const { username } = user
    const agencyId: AgencyId = user.activeCaseLoadId

    const chartDetails = await this.chartService.getChart(username, agencyId, '3b')
    const chartEntries = chartDetails.chartEntries as ChartEntryHorizontalBar[]

    const offenceTypes: DropDownEntry[] = getUniqueItems(chartEntries, {
      source: (row: ChartEntryHorizontalBar) => row.offence_type,
    })
    const offenceType = DropDownEntry.getByValueOrElse(
      offenceTypes,
      req.query['offence-type'] as string,
      offenceTypes[0]
    )

    const chartSettingMap = {}

    chartSettingMap['3b'] = await produceHorizontalBarsChart(
      '3b',
      username,
      agencyId,
      'Adjudication offence type by location – last 30 days (3b)',
      chartDetails,
      { filter: (row: ChartEntryHorizontalBar) => row.offence_type === offenceType.text },
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
      offenceType: offenceType.value,
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
