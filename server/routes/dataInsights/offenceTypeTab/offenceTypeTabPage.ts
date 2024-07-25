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
  TableHead,
} from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { getUniqueItems, produceHorizontalBarsChart, produceLinesCharts } from '../chartService'
import adjudicationUrls from '../../../utils/urlGenerator'
import DropDownEntry from '../dropDownEntry'
import { getFullDate } from '../../../utils/utils'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

const getOffenceTypeHorizontalBarsChartHead = () => {
  const head: TableHead[] = [
    {
      text: 'Location',
      classes: 'horizontal-chart-table-head-cell horizontal-chart-table-head-cell-first',
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
    const agencyId: AgencyId = user.meta.caseLoadId

    const chartSettingMap = {} as Record<string, unknown>
    const lastModifiedDate = getFullDate(
      (await this.chartApiService.getLastModifiedChart(username, '3a')).lastModifiedDate
    )

    chartSettingMap['3a'] = await produceLinesCharts(
      '3a',
      username,
      agencyId,
      'Adjudication offence types - current month and previous 12 months',
      'This chart shows the frequency of the different offence types leading to an adjudication. Are there any insights or trends which can inform any actions?',
      await this.chartApiService.getChart(username, agencyId, '3a'),
      ALL_DATA_FILTER,
      { source: (row: ChartEntryLine) => row.offence_type },
      { source: (row: ChartEntryHorizontalBar) => row.count },
      'Count'
    )

    const chartDetails3b = await this.chartApiService.getChart(username, agencyId, '3b')
    const offenceTypes: DropDownEntry[] = getUniqueItems(chartDetails3b.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.offence_type,
    })
    const offenceType: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      offenceTypes,
      req.query.offenceType as string,
      offenceTypes.length > 0 ? offenceTypes[0] : undefined
    )

    chartSettingMap['3b'] = await produceHorizontalBarsChart(
      '3b',
      username,
      agencyId,
      'Adjudication offence type by location - last 30 days',
      'Select an offence type to see where offences took place. Are there any patterns or surprises? This can help inform actions around hotspots and possible interventions, for example staff awareness.',
      'Where more than 15 locations, only highest 15 are shown.',
      chartDetails3b,
      { filter: (row: ChartEntryHorizontalBar) => row.offence_type === offenceType?.text },
      { source: (row: ChartEntryHorizontalBar) => row.incident_loc },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.incident_loc}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getOffenceTypeHorizontalBarsChartHead(),
      'Percentage'
    )

    return res.render(`pages/dataInsights/offenceTypeTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.OFFENCE_TYPE),
      chartSettingMap,
      lastModifiedDate,
      allSelectorParams: {
        offenceType: offenceType?.value,
      },
      allSelectorSettings: {
        offenceType: {
          id: 'offenceType',
          label: 'Select offence type',
          items: offenceTypes,
          class: 'offenceType-type-selector',
          selectorSubmitButtonClass: 'govuk-button--submit',
        },
      },
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { offenceType, allSelectorParams } = req.body
    const params = {
      ...JSON.parse(allSelectorParams),
      ...(offenceType !== undefined ? { offenceType } : {}),
    }
    return res.redirect(adjudicationUrls.dataInsights.urls.offenceType(params))
  }
}
