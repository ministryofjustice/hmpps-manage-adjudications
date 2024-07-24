/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import {
  ALL_DATA_FILTER,
  ChartDetailsResult,
  ChartEntryCommentary,
  ChartEntryHorizontalBar,
  ChartEntryLine,
} from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import {
  getUniqueItems,
  produceCommentaryChart,
  produceLinesCharts,
  produceMultiVerticalBarsCharts,
} from '../chartService'
import DropDownEntry from '../dropDownEntry'
import adjudicationUrls from '../../../utils/urlGenerator'
import { getFullDate } from '../../../utils/utils'

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
    const agencyId: AgencyId = user.meta.caseLoadId

    const chartSettingMap = {} as Record<string, any>

    const lastModifiedDate = getFullDate(
      (await this.chartApiService.getLastModifiedChart(username, '4a')).lastModifiedDate
    )

    chartSettingMap['4a'] = await produceLinesCharts(
      '4a',
      username,
      agencyId,
      'Punishments given – current month and previous 12 months',
      'This chart shows how many times different punishments were given. This includes suspended punishments. Are there any patterns or surprises that can inform actions?',
      await this.chartApiService.getChart(username, agencyId, '4a'),
      ALL_DATA_FILTER,
      { source: (row: ChartEntryLine) => row.sanction },
      { source: (row: ChartEntryHorizontalBar) => row.count },
      'Count'
    )

    const chartDetails4b = await this.chartApiService.getChart(username, agencyId, '4b')
    const offenceTypes: DropDownEntry[] = getUniqueItems(chartDetails4b.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.offence_type,
    })
    const offenceType: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      offenceTypes,
      req.query.offenceType as string,
      offenceTypes.length > 0 ? offenceTypes[0] : undefined
    )

    chartSettingMap['4d'] = await produceCommentaryChart(
      '4d',
      username,
      agencyId,
      'Most commonly used punishment last month',
      '',
      'In',
      'of cases this was used in combination with other punishments.',
      await this.chartApiService.getChart(username, agencyId, '4d'),
      {
        source: (row: ChartEntryHorizontalBar): ChartEntryCommentary => {
          return {
            data: row.sanction,
            proportion: `${Math.trunc(row.proportion * 100)}%`,
          } as ChartEntryCommentary
        },
      }
    )

    chartSettingMap['4b'] = await produceLinesCharts(
      '4b',
      username,
      agencyId,
      'Punishments given for each adjudication offence type - current month and previous 12 months',
      'Select an offence type to explore patterns of punishments given. Are you content with the consistency and appropriateness of the punishments? Are there any insights to inform actions?',
      chartDetails4b,
      { filter: (row: ChartEntryHorizontalBar) => row.offence_type === offenceType?.text },
      { source: (row: ChartEntryLine) => row.sanction },
      { source: (row: ChartEntryHorizontalBar) => row.count },
      'Count'
    )

    chartSettingMap['4c'] = await produceMultiVerticalBarsCharts(
      '4c',
      username,
      agencyId,
      'Suspended and activated punishments - current month and last 12 months',
      'This chart shows suspended punishments as a proportion of total punishments given. Are you content with these levels and any trends shown?',
      await this.chartApiService.getChart(username, agencyId, '4c'),
      { source: (row: ChartEntryLine) => row.status },
      { source: (row: ChartEntryLine) => Math.trunc(row.proportion * 100) },
      { source: (row: ChartEntryLine) => `${row.year}-${row.month}` },
      { source: (row: ChartEntryLine) => row.count },
      'Percentage',
      'Total punishments'
    )

    return res.render(`pages/dataInsights/punishmentsTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PUNISHMENTS),
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
    return res.redirect(adjudicationUrls.dataInsights.urls.punishments(params))
  }
}
