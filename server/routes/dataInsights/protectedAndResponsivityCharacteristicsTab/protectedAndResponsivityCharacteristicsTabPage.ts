/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryHorizontalBar, TableHead } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'
import { getUniqueItems, produceHorizontalBarsChart } from '../chartService'
import adjudicationUrls from '../../../utils/urlGenerator'
import DropDownEntry from '../dropDownEntry'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

const getHorizontalBarsChartHeadByCharacteristic = (
  mainLabel: string,
  percentageLabel: string,
  numberLabel: string
) => {
  const head: TableHead[] = [
    {
      text: mainLabel,
      classes: 'horizontal-chart-table-head-cell horizontal-chart-table-head-cell-first',
    },
    {
      text: percentageLabel,
      classes: 'horizontal-chart-table-head-cell',
    },
    {
      text: numberLabel,
      classes: 'horizontal-chart-table-head-cell',
    },
  ]
  return head
}

export default class ProtectedAndResponsivityCharacteristicsTabPage {
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

    const chartDetails2a = await this.chartApiService.getChart(username, agencyId, '2a')
    const characteristics: DropDownEntry[] = getUniqueItems(chartDetails2a.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.characteristic,
    })
    const characteristic: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      characteristics,
      req.query.characteristic as string,
      characteristics.length > 0 ? characteristics[0] : undefined
    )
    chartSettingMap['2a'] = await produceHorizontalBarsChart(
      '2a',
      username,
      agencyId,
      'Overview of prisoners in the establishment - last 30 days',
      'This chart shows the recent numbers of prisoners in your establishment in each sub-group of the selected characteristic. It provides context and a comparison for the subsequent charts.',
      chartDetails2a,
      { filter: (row: ChartEntryHorizontalBar) => row.characteristic === characteristic?.text },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(
        characteristic?.text,
        'Percentage of prisoners',
        'Number of prisoners'
      ),
      'Percentage'
    )

    chartSettingMap['2b'] = await produceHorizontalBarsChart(
      '2b',
      username,
      agencyId,
      'Adjudication reports by protected or responsivity characteristic - last 30 days',
      'Use this chart to see adjudications by this characteristic and compare them to prison numbers. Are there any imbalances you might want to explore further?',
      await this.chartApiService.getChart(username, agencyId, '2b'),
      { filter: (row: ChartEntryHorizontalBar) => row.characteristic === characteristic?.text },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of reports', 'Number of reports'),
      'Percentage'
    )

    const chartDetails2d = await this.chartApiService.getChart(username, agencyId, '2d')
    const offenceTypes: DropDownEntry[] = getUniqueItems(chartDetails2d.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.offence_type,
    })
    const offenceType: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      offenceTypes,
      req.query.offenceType as string,
      offenceTypes.length > 0 ? offenceTypes[0] : undefined
    )
    chartSettingMap['2d'] = await produceHorizontalBarsChart(
      '2d',
      username,
      agencyId,
      'Adjudication offence type by protected or responsivity characteristic - last 30 days',
      'Select an offence type to explore differences within this characteristic. Compared to overall prison numbers, are there any insights or concerns you want to explore or monitor?',
      chartDetails2d,
      {
        filter: (row: ChartEntryHorizontalBar) =>
          row.characteristic === characteristic?.text && row.offence_type === offenceType?.text,
      },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of offences', 'Number of offences'),
      'Percentage'
    )

    const chartDetails2e = await this.chartApiService.getChart(username, agencyId, '2e')
    const punishments: DropDownEntry[] = getUniqueItems(chartDetails2e.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.sanction,
    })
    const punishment: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      punishments,
      req.query.punishment as string,
      punishments.length > 0 ? punishments[0] : undefined
    )
    chartSettingMap['2e'] = await produceHorizontalBarsChart(
      '2e',
      username,
      agencyId,
      'Punishment by protected or responsivity characteristic - last 30 days',
      'Select a punishment type to explore differences within this. Compared to overall prison numbers, are there any insights or concerns you want to explore or monitor?',
      chartDetails2e,
      {
        filter: (row: ChartEntryHorizontalBar) =>
          row.characteristic === characteristic?.text && row.sanction === punishment?.text,
      },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(
        characteristic?.text,
        'Percentage of punishments',
        'Number of punishments'
      ),
      'Percentage'
    )

    const chartDetails2f = await this.chartApiService.getChart(username, agencyId, '2f')
    const pleas: DropDownEntry[] = getUniqueItems(chartDetails2f.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.plea,
    })
    const plea: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      pleas,
      req.query.plea as string,
      pleas.length > 0 ? pleas[0] : undefined
    )
    chartSettingMap['2f'] = await produceHorizontalBarsChart(
      '2f',
      username,
      agencyId,
      'Plea by protected or responsivity characteristic - last 30 days',
      'Select a plea to explore differences within this characteristic. Compared to overall prison numbers, are there any insights or concerns you want to explore or monitor?',
      chartDetails2f,
      {
        filter: (row: ChartEntryHorizontalBar) =>
          row.characteristic === characteristic?.text && row.plea === plea?.text,
      },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of please', 'Number of please'),
      'Percentage'
    )

    const chartDetails2g = await this.chartApiService.getChart(username, agencyId, '2g')
    const findings: DropDownEntry[] = getUniqueItems(chartDetails2g.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.finding,
    })
    const finding: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      findings,
      req.query.finding as string,
      findings.length > 0 ? findings[0] : undefined
    )
    chartSettingMap['2g'] = await produceHorizontalBarsChart(
      '2g',
      username,
      agencyId,
      'Finding by protected or responsivity characteristic - last 30 days',
      'Select a finding to explore differences within this characteristic. Compared to overall prison numbers, are there any insights or concerns you want to explore or monitor?',
      chartDetails2g,
      {
        filter: (row: ChartEntryHorizontalBar) =>
          row.characteristic === characteristic?.text && row.finding === finding?.text,
      },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of findings', 'Number of findings'),
      'Percentage'
    )

    return res.render(`pages/dataInsights/protectedAndResponsivityCharacteristicsTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PROTECTED_AND_RESPONSIVITY_CHARACTERISTICS),
      chartSettingMap,
      allSelectorParams: {
        characteristic: characteristic?.value,
        offenceType: offenceType?.value,
        punishment: punishment?.value,
        plea: plea?.value,
        finding: finding?.value,
      },
      allSelectorSettings: {
        characteristic: {
          id: 'characteristic',
          label: 'Select a characteristic',
          items: characteristics,
          class: 'characteristic-type-selector',
          selectorSubmitButtonClass: 'govuk-button--submit',
        },
        offenceType: {
          id: 'offenceType',
          label: 'Select offence type',
          items: offenceTypes,
          class: 'offenceType-type-selector',
          selectorSubmitButtonClass: 'govuk-button--secondary',
        },
        punishment: {
          id: 'punishment',
          label: 'Select punishment type',
          items: punishments,
          class: 'punishment-type-selector',
          selectorSubmitButtonClass: 'govuk-button--secondary',
        },
        plea: {
          id: 'plea',
          label: 'Select plea',
          items: pleas,
          class: 'plea-type-selector',
          selectorSubmitButtonClass: 'govuk-button--secondary',
        },
        finding: {
          id: 'finding',
          label: 'Select finding',
          items: findings,
          class: 'finding-type-selector',
          selectorSubmitButtonClass: 'govuk-button--secondary',
        },
      },
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {} as PageData)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { characteristic, offenceType, punishment, plea, finding, allSelectorParams } = req.body
    const params = {
      ...JSON.parse(allSelectorParams),
      ...(characteristic !== undefined ? { characteristic } : {}),
      ...(offenceType !== undefined ? { offenceType } : {}),
      ...(punishment !== undefined ? { punishment } : {}),
      ...(plea !== undefined ? { plea } : {}),
      ...(finding !== undefined ? { finding } : {}),
    }
    return res.redirect(adjudicationUrls.dataInsights.urls.protectedAndResponsivityCharacteristics(params))
  }
}
