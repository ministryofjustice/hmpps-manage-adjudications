/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { FormError } from '../../../@types/template'
import ChartApiService from '../../../services/chartApiService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntryHorizontalBar } from '../../../services/ChartDetailsResult'
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
  const head: { text: string; classes: string }[] = [
    {
      text: mainLabel,
      classes: 'horizontal-chart-table-head-cell horizontal-chart-table-head-cell-width-auto',
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

    const chartSettingMap = {}

    const chartDetails2a = await this.chartApiService.getChart(username, agencyId, '2a')
    const protectedCharacteristics: DropDownEntry[] = getUniqueItems(
      chartDetails2a.chartEntries as ChartEntryHorizontalBar[],
      {
        source: (row: ChartEntryHorizontalBar) => row.characteristic,
      }
    )
    const characteristic: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      protectedCharacteristics,
      req.query.characteristic as string,
      protectedCharacteristics.length > 0 ? protectedCharacteristics[0] : undefined
    )
    chartSettingMap['2a'] = await produceHorizontalBarsChart(
      '2a',
      username,
      agencyId,
      'Overview of prisoners in the establishment currently (2a)',
      chartDetails2a,
      { filter: (row: ChartEntryHorizontalBar) => row.characteristic === characteristic?.text },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of prisoners', 'Number of prisoners')
    )

    chartSettingMap['2b'] = await produceHorizontalBarsChart(
      '2b',
      username,
      agencyId,
      'Adjudication reports by protected or responsivity characteristic – last 30 days (2b)',
      await this.chartApiService.getChart(username, agencyId, '2b'),
      { filter: (row: ChartEntryHorizontalBar) => row.characteristic === characteristic?.text },
      { source: (row: ChartEntryHorizontalBar) => row.value },
      { source: (row: ChartEntryHorizontalBar) => Math.trunc(row.proportion * 100) },
      [
        { source: (row: ChartEntryHorizontalBar) => `${row.value}` },
        { source: (row: ChartEntryHorizontalBar) => `${Math.trunc(row.proportion * 100)}%` },
        { source: (row: ChartEntryHorizontalBar) => row.count },
      ],
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of reports', 'Number of reports')
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
      'Adjudication offence type by protected or responsivity characteristic - last 30 days (2d)',
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
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of offences', 'Number of offences')
    )

    const chartDetails2e = await this.chartApiService.getChart(username, agencyId, '2e')
    const sanctions: DropDownEntry[] = getUniqueItems(chartDetails2e.chartEntries as ChartEntryHorizontalBar[], {
      source: (row: ChartEntryHorizontalBar) => row.sanction,
    })
    const sanction: DropDownEntry | undefined = DropDownEntry.getByValueOrElse(
      sanctions,
      req.query.sanction as string,
      sanctions.length > 0 ? sanctions[0] : undefined
    )
    chartSettingMap['2e'] = await produceHorizontalBarsChart(
      '2e',
      username,
      agencyId,
      'Punishment by protected or responsivity characteristic - last 30 days (2e)',
      chartDetails2e,
      {
        filter: (row: ChartEntryHorizontalBar) =>
          row.characteristic === characteristic?.text && row.sanction === sanction?.text,
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
      )
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
      'Plea by protected or responsivity characteristic - last 30 days (2f)',
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
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of please', 'Number of please')
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
      'Finding by protected or responsivity characteristic - last 30 days (2g)',
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
      getHorizontalBarsChartHeadByCharacteristic(characteristic?.text, 'Percentage of findings', 'Number of findings')
    )

    return res.render(`pages/dataInsights/protectedCharacteristicsAndVulnerabilitiesTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.PROTECTED_CHARACTERISTICS_AND_VULNERABILITIES),
      chartSettingMap,
      allSelectorParams: {
        characteristic: characteristic?.value,
        offenceType: offenceType?.value,
        sanction: sanction?.value,
        plea: plea?.value,
        finding: finding?.value,
      },
      allSelectorSettings: {
        characteristic: {
          id: 'characteristic',
          label: 'Select a protected characteristic or vulnerability',
          items: protectedCharacteristics,
        },
        offenceType: {
          id: 'offenceType',
          label: 'Select offence type',
          items: offenceTypes,
        },
        sanction: {
          id: 'sanction',
          label: 'Select punishment type',
          items: sanctions,
        },
        plea: {
          id: 'plea',
          label: 'Select plea',
          items: pleas,
        },
        finding: {
          id: 'finding',
          label: 'Select finding',
          items: findings,
        },
      },
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {} as PageData)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    const { characteristic, offenceType, sanction, plea, finding, allSelectorParams } = req.body
    const params = {
      ...JSON.parse(allSelectorParams),
      ...(characteristic !== undefined ? { characteristic } : {}),
      ...(offenceType !== undefined ? { offenceType } : {}),
      ...(sanction !== undefined ? { sanction } : {}),
      ...(plea !== undefined ? { plea } : {}),
      ...(finding !== undefined ? { finding } : {}),
    }
    return res.redirect(adjudicationUrls.dataInsights.urls.protectedCharacteristicsAndVulnerabilities(params))
  }
}
