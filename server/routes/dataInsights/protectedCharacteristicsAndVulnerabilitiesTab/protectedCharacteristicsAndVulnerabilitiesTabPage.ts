/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryHorizontalBar } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { produceHorizontalBarsChart } from '../chartService'
import adjudicationUrls from '../../../utils/urlGenerator'
import ProtectedCharacteristic from '../protectedCharacteristic'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
  characteristic: ProtectedCharacteristic
}

class PageOptions {}

const getHorizontalBarsChartHeadByCharacteristic = (characteristic: string) => {
  const head: { text: string; classes: string }[] = [
    {
      text: characteristic,
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

export default class ProtectedCharacteristicsAndVulnerabilitiesTabPage {
  pageOptions: PageOptions

  constructor(private readonly chartApiService: ChartApiService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData
    const { user } = res.locals
    const { username } = user
    const agencyId: AgencyId = user.activeCaseLoadId

    const protectedCharacteristics: ProtectedCharacteristic[] =
      ProtectedCharacteristic.getProtectedCharacteristicsAndVulnerabilitiesValues()

    const characteristic = ProtectedCharacteristic.valueOfOrElse(
      req.query.characteristic as string,
      protectedCharacteristics[0]
    )

    const chartSettingMap = {}

    chartSettingMap['2a'] = await produceHorizontalBarsChart(
      '2a',
      username,
      agencyId,
      'Percentage and number of prisoners in the establishment currently (2a)',
      await this.chartApiService.getChart(username, agencyId, '2a'),
      { filter: (row: ChartEntryHorizontalBar) => row.characteristic === characteristic.value },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion_round * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` }, // [${row.characteristic}]
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion_round * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(characteristic.text)
    )

    chartSettingMap['2b'] = await produceHorizontalBarsChart(
      '2b',
      username,
      agencyId,
      'Percentage and number of prisoners with an adjudication by protected characteristic or vulnerability – last 30 days (2b)',
      await this.chartApiService.getChart(username, agencyId, '2b'),
      { filter: (row: ChartEntryHorizontalBar) => row.characteristic === characteristic.value },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion_round * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion_round * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(characteristic.text)
    )

    return res.render(`pages/dataInsights/protectedCharacteristicsAndVulnerabilitiesTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PROTECTED_CHARACTERISTICS_AND_VULNERABILITIES),
      chartSettingMap,
      protectedCharacteristics,
      characteristic: characteristic.value,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {} as PageData)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { characteristic } = req.body
    return res.redirect(adjudicationUrls.dataInsights.urls.protectedCharacteristicsAndVulnerabilities(characteristic))
  }
}
