/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import { ChartOptions } from 'chart.js'
import { FormError } from '../../../@types/template'
import ChartService from '../../../services/chartService'
import { AgencyId } from '../../../data/PrisonLocationResult'
import { ChartDetailsResult, ChartEntry, getMonthShortName } from '../../../services/ChartDetailsResult'
import { DataInsightsTab, getDataInsightsTabsOptions } from '../dataInsightsTabsOptions'

type PageData = {
  error?: FormError
  chartDetails?: ChartDetailsResult
}

class PageOptions {}

const DARK_BLUE = '#003078'
const DARK_BLUE_DARKER = '#00265f'
const LIGHT_BLUE = '#5694ca'
const LIGHT_BLUE_DARKER = '#4388c4'
const TURQUOISE = '#28a197'
const LIGHT_PURPLE = '#8c8ec0'
// const LIGHT_GREY = '#b1b4b6'
const FONT_FAMILY = '"GDS Transport",arial,sans-serif'

const createBarsAndLineChartSettings = (params: {
  elementId: string
  chartTitle: string
  barData: number[]
  lineData: number[]
  labels: string[][]
  head: never[]
  rows: {
    text: string | number
    classes: string
  }[][]
}) => {
  const dataLength = params.barData.length
  const barsColors = [...[...Array(Math.max(dataLength - 1, 0))].map(() => DARK_BLUE), LIGHT_BLUE]
  const barsColorsDarker = [...[...Array(Math.max(dataLength - 1, 0))].map(() => DARK_BLUE_DARKER), LIGHT_BLUE_DARKER]

  return {
    title: params.chartTitle,
    chartData: {
      elementId: params.elementId,
      chartOptions: {
        data: {
          datasets: [
            {
              type: 'bar',
              order: 2,
              label: 'This year 2023',
              data: params.barData,
              backgroundColor: barsColors,
              hoverBackgroundColor: barsColorsDarker,
              hoverBorderWidth: 1,
              hoverBorderColor: barsColorsDarker,
            },
            {
              type: 'line',
              order: 1,
              label: 'Previous year 2022',
              data: params.lineData,
              fill: false,
              borderColor: TURQUOISE,
              backgroundColor: TURQUOISE,
              pointBackgroundColor: TURQUOISE,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 1,
              pointHoverBackgroundColor: ['#ffffff', '#000000'],
              pointHoverBorderColor: TURQUOISE,
              pointHoverBorderWidth: 3,
              tension: 0,
              borderWidth: 2,
              pointStyle: 'circle',
              font: {
                size: 16,
                weight: '600',
              },
            },
            {
              type: 'line',
              order: 3,
              label: 'Current incomplete month',
              data: [],
              fill: false,
              borderColor: LIGHT_BLUE,
              backgroundColor: LIGHT_BLUE,
              tension: 1,
            },
          ],
          labels: params.labels,
        },
        options: {
          scales: {
            x: {
              border: {
                color: 'black',
              },
              display: true,
              ticks: {
                display: true,
                color: 'black',
                font: {
                  size: 16,
                  weight: '600',
                },
              },
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              display: true,
              ticks: {
                stepSize: 20,
                font: {
                  size: 20,
                  weight: '400',
                },
              },
            },
          },
          plugins: {
            layout: {
              padding: 30,
            },
            legend: {
              onClick: null,
              position: 'top',
              labels: {
                font: {
                  size: 20,
                  family: FONT_FAMILY,
                },
                padding: 20,
                boxWidth: 40,
                boxHeight: 25,
              },
            },
            title: {
              display: false,
              text: params.chartTitle,
              font: {
                size: 30,
                family: FONT_FAMILY,
              },
            },
            tooltip: {
              backgroundColor: LIGHT_PURPLE,
              titleColor: 'white',
              titleFontX: FONT_FAMILY,
              titleAlign: 'center',
              titleSpacing: 2,
              titleMarginBottom: 6,
              titleFont: {
                size: 18,
                family: FONT_FAMILY,
              },
              bodyColor: 'white',
              bodySpacing: 2,
              bodyFont: {
                size: 14,
                family: FONT_FAMILY,
              },
            },
          },
        },
      } as ChartOptions,
    },
    tableData: {
      head: params.head,
      rows: params.rows,
    },
  }
}

const getRows = (barData: number[], lineData: number[]) => {
  const rows2: { text: string | number; classes: string }[][] = [
    [
      {
        text: 'Number this year 2023',
        classes: 'chart-table-panel-series',
      },
      ...barData.map(value => {
        return {
          text: value,
          classes: 'chart-table-panel-value',
        }
      }),
    ],
    [
      {
        text: 'Number previous year 2022',
        classes: 'chart-table-panel-series',
      },
      ...lineData.map(value => {
        return {
          text: value,
          classes: 'chart-table-panel-value',
        }
      }),
    ],
  ]
  return rows2
}

export default class TotalsAdjudicationsAndLocationsTabPage {
  pageOptions: PageOptions

  constructor(private readonly chartService: ChartService) {
    this.pageOptions = new PageOptions()
  }

  private renderView = async (req: Request, res: Response, pageData: PageData): Promise<void> => {
    const { error } = pageData

    const { user } = res.locals
    const { username } = user
    const agencyId: AgencyId = user.activeCaseLoadId

    const chartSettingList = [
      await this.extracted(username, agencyId, '1a'),
      await this.extracted(username, 'BCI', '1b'),
    ]

    return res.render(`pages/dataInsights/totalsAdjudicationsAndLocationsTab.njk`, {
      errors: error ? [error] : [],
      tabsOptions: getDataInsightsTabsOptions(DataInsightsTab.TOTALS_ADJUDICATIONS_AND_LOCATIONS),
      chartSettingList,
    })
  }

  private async extracted(username: string, agencyId: string, chartName: string) {
    const chartDetails: ChartDetailsResult = await this.chartService.getChart(username, agencyId, chartName)
    const { chartEntries } = chartDetails

    const labels: string[][] = chartEntries.map((entry: ChartEntry) => {
      return [getMonthShortName(entry.month), `${entry.year_curr}`]
    })

    return createBarsAndLineChartSettings({
      elementId: chartName,
      chartTitle: 'Total adjudications - over 24 months',
      barData: chartEntries.map((entry: ChartEntry) => entry.count_curr),
      lineData: chartEntries.map((entry: ChartEntry) => entry.count_prev),
      labels,
      head: [],
      rows: getRows(
        chartEntries.map((entry: ChartEntry) => entry.count_curr),
        chartEntries.map((entry: ChartEntry) => entry.count_prev)
      ),
    })
  }

  view = async (req: Request, res: Response): Promise<void> => {
    return this.renderView(req, res, {})
  }
}
