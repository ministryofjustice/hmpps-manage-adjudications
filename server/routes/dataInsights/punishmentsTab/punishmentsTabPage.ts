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
import { getUniqueItems, produceLinesCharts, produceMultiVerticalBarsCharts } from '../chartService'
import DropDownEntry from '../dropDownEntry'
import adjudicationUrls from '../../../utils/urlGenerator'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

export default class PunishmentsTabPage {
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

    chartSettingMap['4a'] = await produceLinesCharts(
      '4a',
      username,
      agencyId,
      'Total adjudications by punishment - current month and previous 12 months (4a)',
      'This chart shows how many times different punishments were given. This includes suspended punishments. Are there any patterns or surprises that can inform actions?',
      await this.chartApiService.getChart(username, agencyId, '4a'),
      ALL_DATA_FILTER,
      { source: (row: ChartEntryLine) => row.sanction },
      { source: (row: ChartEntryHorizontalBar) => row.count }
    )

    const chartDetails4b = await this.chartApiService.getChart(username, agencyId, '4b')
    const offenceTypes: DropDownEntry[] = getUniqueItems(chartDetails4b.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.offence_type,
    })
    const offenceType: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      offenceTypes,
      req.query['offence-type'] as string,
      offenceTypes.length > 0 ? offenceTypes[0] : undefined
    )

    chartSettingMap['4b'] = await produceLinesCharts(
      '4b',
      username,
      agencyId,
      'Total adjudications for each adjudication offence type broken down by punishment - current month and previous 12 months (4b)',
      'Select an offence type to explore patterns of punishments given. Are you content with the consistency and appropriateness of the punishments? Are there any insights to inform actions? ',
      chartDetails4b,
      { filter: (row: ChartEntryHorizontalBar) => row.offence_type === offenceType?.text },
      { source: (row: ChartEntryLine) => row.sanction },
      { source: (row: ChartEntryHorizontalBar) => row.count }
    )

    chartSettingMap['4c'] = await produceMultiVerticalBarsCharts(
      '4c',
      username,
      agencyId,
      'Percentage of suspended and activated punishments - current month and last 12 months (4c)',
      'This chart shows suspended punishments as a proportion of total punishments given. Are you content with these levels and any trends shown.',
      await this.chartApiService.getChart(username, agencyId, '4c'),
      { source: (row: ChartEntryLine) => row.status },
      { source: (row: ChartEntryLine) => Math.trunc(row.proportion * 100) },
      { source: (row: ChartEntryLine) => `${row.year}-${row.month}` },
      { source: (row: ChartEntryLine) => row.count }
    )

    return res.render(`pages/dataInsights/punishmentsTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PUNISHMENTS),
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
    return res.redirect(adjudicationUrls.dataInsights.urls.punishments(offenceType))
  }
}
