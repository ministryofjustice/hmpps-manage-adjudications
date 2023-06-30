import { ChartOptions } from 'chart.js'
import {
  ChartDetailsResult,
  ChartEntryHorizontalBar,
  ChartEntryVerticalBar,
  getMonthShortName,
  HorizontalTableCell,
} from '../../services/ChartDetailsResult'

const DARK_BLUE = '#003078'
const DARK_BLUE_DARKER = '#00265f'
const LIGHT_BLUE = '#5694ca'
const LIGHT_BLUE_DARKER = '#4388c4'
const TURQUOISE = '#28a197'
const LIGHT_PURPLE = '#8c8ec0'
// const LIGHT_GREY = '#b1b4b6'
const FONT_FAMILY = '"GDS Transport",arial,sans-serif'

export const produceVerticalBarsAndLineCharts = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartDetails: ChartDetailsResult
) => {
  const chartEntries = chartDetails.chartEntries as ChartEntryVerticalBar[]

  const labels: string[][] = chartEntries.map((entry: ChartEntryVerticalBar) => {
    return [getMonthShortName(entry.month), `${entry.year_curr}`]
  })

  return createVerticalBarsAndLineChartSettings({
    elementId: chartName,
    chartTitle,
    barData: chartEntries.map((entry: ChartEntryVerticalBar) => entry.count_curr),
    lineData: chartEntries.map((entry: ChartEntryVerticalBar) => entry.count_prev),
    labels,
    head: [],
    rows: getVerticalBarsAndLineChartRows(
      chartEntries.map((entry: ChartEntryVerticalBar) => entry.count_curr),
      chartEntries.map((entry: ChartEntryVerticalBar) => entry.count_prev)
    ),
  })
}

export const produceHorizontalBarsChart = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartDetails: ChartDetailsResult,
  labelFieldSource: HorizontalTableCell,
  barsDataSource: HorizontalTableCell,
  rowsSource: HorizontalTableCell[]
) => {
  const chartEntries = chartDetails.chartEntries as ChartEntryHorizontalBar[]

  const barData = chartEntries.map((row: ChartEntryHorizontalBar) => {
    return barsDataSource.source(row) as number
  })

  const labels = chartEntries.map((row: ChartEntryHorizontalBar) => {
    return labelFieldSource.source(row) as string
  })

  return createHorizontalBarsChartSettings({
    elementId: chartName,
    chartTitle,
    barData,
    labels,
    head: getHorizontalBarsChartHead(),
    rows: getHorizontalBarsChartRows(chartEntries, rowsSource),
  })
}

export const createHorizontalBarsChartSettings = (params: {
  elementId: string
  chartTitle: string
  barData: number[] | string[]
  labels: string[]
  head: { text: string; classes: string }[]
  rows: {
    text: string | number
    classes: string
  }[][]
}) => {
  const barsColors = [DARK_BLUE]
  const barsColorsDarker = [DARK_BLUE_DARKER]

  return {
    title: params.chartTitle,
    chartData: {
      elementId: params.elementId,
      chartOptions: {
        data: {
          datasets: [
            {
              type: 'bar',
              order: 1,
              label: 'Last 30 days',
              data: params.barData,
              options: {
                indexAxis: 'y',
              },
              // axis: 'y',
              backgroundColor: barsColors,
              hoverBackgroundColor: barsColorsDarker,
              hoverBorderWidth: 1,
              hoverBorderColor: barsColorsDarker,
              // barPercentage: 0.7, // default 0.9
              barThickness: 35,
              maxBarThickness: 50,
              // categoryPercentage: 0.8, // default 0.8
              // base: 0,
            },
          ],
          labels: params.labels,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          scales: {
            x: {
              border: {
                color: 'black',
              },
              display: true,
              beginAtZero: true,
              ticks: {
                display: true,
                stepSize: 25,
                color: 'black',
                font: {
                  size: 16,
                  weight: '600',
                },
              },
              grid: {
                display: true,
              },
            },
            y: {
              display: false,
              ticks: {
                display: false,
              },
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            layout: {
              padding: 30,
            },
            legend: {
              display: false,
            },
            title: {
              display: false,
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
            labels: {
              display: false,
            },
            label: {
              display: false,
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

export const createVerticalBarsAndLineChartSettings = (params: {
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

export const getVerticalBarsAndLineChartRows = (barData: number[], lineData: number[]) => {
  const rows: { text: string | number; classes: string }[][] = [
    [
      {
        text: 'Number this year 2023',
        classes: 'vertical-chart-table-head-cell',
      },
      ...barData.map(value => {
        return {
          text: value,
          classes: 'vertical-chart-table-row-cell',
        }
      }),
    ],
    [
      {
        text: 'Number previous year 2022',
        classes: 'vertical-chart-table-head-cell',
      },
      ...lineData.map(value => {
        return {
          text: value,
          classes: 'vertical-chart-table-row-cell',
        }
      }),
    ],
  ]
  return rows
}

export const getHorizontalBarsChartHead = () => {
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

export const getHorizontalBarsChartRows = (
  chartEntries: ChartEntryHorizontalBar[],
  rowsSource: HorizontalTableCell[]
) => {
  const rows: { text: string | number; classes: string }[][] = [
    ...chartEntries.map((row: ChartEntryHorizontalBar) => {
      return rowsSource.map((horizontalTableCell: HorizontalTableCell) => {
        return {
          text: horizontalTableCell.source(row),
          classes: 'horizontal-chart-table-row-cell',
        }
      })
    }),
  ]

  return rows
}
