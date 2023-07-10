import { ChartDataset, ChartOptions, Defaults, LegendOptions, LinearScaleOptions } from 'chart.js'
import {
  ChartDetailsResult,
  ChartEntryCommentary,
  ChartEntryHorizontalBar,
  ChartEntryLine,
  ChartEntryVerticalBar,
  DataFilter,
  getMonthShortName,
  RowSource,
} from '../../services/ChartDetailsResult'
import DropDownEntry from './dropDownEntry'

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
  dataFilter: DataFilter,
  labelFieldSource: RowSource,
  barsDataSource: RowSource,
  rowsSource: RowSource[],
  head: { text: string; classes: string }[]
) => {
  const chartEntries = (chartDetails.chartEntries as ChartEntryHorizontalBar[]).filter(
    (row: ChartEntryHorizontalBar) => {
      return dataFilter.filter(row)
    }
  )

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
    head,
    rows: getHorizontalBarsChartRows(chartEntries, rowsSource),
  })
}

export const produceCommentaryChart = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartDetails: ChartDetailsResult,
  rowsSource: RowSource
) => {
  const chartEntries: ChartEntryCommentary[] = (chartDetails.chartEntries as ChartEntryHorizontalBar[]).map(
    (row: ChartEntryHorizontalBar) => {
      return rowsSource.source(row) as ChartEntryCommentary
    }
  )
  return createCommentaryChartSettings({
    elementId: chartName,
    chartTitle,
    chartEntries,
  })
}

export const produceLinesCharts = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartDetails: ChartDetailsResult,
  legendsSource: RowSource,
  yValueSource: RowSource
) => {
  const chartEntries = chartDetails.chartEntries as ChartEntryLine[]

  const chartEntriesMap: Map<string, ChartEntryLine[]> = chartEntries.reduce(
    (entryMap: Map<string, ChartEntryLine[]>, row: ChartEntryLine) =>
      entryMap.set(
        legendsSource.source(row) as string,
        [...(entryMap.get(legendsSource.source(row) as string) || []), row].sort((row1, row2) => {
          if (row1.year === row2.year) {
            return row1.month - row2.month
          }
          return row1.year - row2.year
        })
      ),
    new Map<string, ChartEntryLine[]>()
  )

  return createLinesChartsSettings({
    elementId: chartName,
    chartTitle,
    chartEntriesMap,
    yValueSource,
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

export const createLinesChartsSettings = (params: {
  elementId: string
  chartTitle: string
  chartEntriesMap: Map<string, ChartEntryLine[]>
  yValueSource: RowSource
}) => {
  const linesLegends = Array.from(params.chartEntriesMap.keys())

  const labels: string[][] =
    linesLegends.length > 0
      ? params.chartEntriesMap.get(linesLegends[0]).map((entry: ChartEntryLine) => {
          return [getMonthShortName(entry.month), `${Math.trunc(entry.year)}`]
        })
      : []

  const lineColorsOptions = [
    ['#5694ca', '#397bb4'],
    ['#003078', '#001c45'],
    ['#ffdd00', '#ccb100'],
    ['#d53880', '#b42667'],
    ['#b1b4b6', '#979b9d'],
    ['#28a197', '#1e7871'],
    ['#aa2a16', '#7d1f10'],
    ['#f47738', '#ec580d'],
    ['#f499be', '#ef6ba1'],
    ['#4c2c92', '#38206b'],
  ]
  const lineColors = [...lineColorsOptions, ...lineColorsOptions, ...lineColorsOptions].splice(0, linesLegends.length)

  const datasets = linesLegends.map((legend, i) => {
    const chartEntries: ChartEntryLine[] = params.chartEntriesMap.get(legend)
    return {
      type: 'line',
      order: i + 1,
      label: legend,
      data: chartEntries.map((row: ChartEntryLine) => {
        return params.yValueSource.source(row) as number
      }),
      borderColor: lineColors[i][0],
      backgroundColor: lineColors[i][0],

      hoverColor: '#D53880',
      hoverBorderColor: lineColors[i][1],
      hoverBorderWidth: 4,

      pointBackgroundColor: lineColors[i][0],
      pointBorderColor: lineColors[i][0],
      pointBorderWidth: 1,
      pointHoverBackgroundColor: '#ffffff',
      pointHoverBorderColor: lineColors[i][1],
      pointHoverBorderWidth: 3,
      tension: 0,
      borderWidth: 2,
      pointStyle: 'circle',
      font: {
        size: 16,
        weight: '600',
      },
    } as ChartDataset<'line'> & object
    // ChartDataset<'line'> & LineOptions  & Defaults & PointPrefixedHoverOptions & PointElement & LineOptions & object
  })
  return {
    title: params.chartTitle,
    chartData: {
      elementId: params.elementId,
      chartOptions: {
        data: {
          datasets,
          labels,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          hover: {
            mode: 'dataset',
          } as object,
          scales: {
            x: {
              offset: true,
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
            } as object,
            y: {
              title: {
                display: false,
                text: 'Count',
                color: 'black',
                font: {
                  size: 16,
                  weight: '600',
                },
                align: 'end',
              },
              beginAtZero: true,
              offset: true,
              display: true,
              ticks: {
                stepSize: 20,
                font: {
                  size: 20,
                  weight: '400',
                },
              },
            } as LinearScaleOptions & object,
          } as object,
          plugins: {
            layout: {
              padding: 30,
            },
            legend: {
              display: true,
              position: 'bottom',
              align: 'start',
              labels: {
                font: {
                  size: 18,
                  family: FONT_FAMILY,
                },
                padding: 20,
                boxWidth: 20,
                boxHeight: 25,
              },
              title: {
                display: true,
                // padding: 15,
                padding: {
                  top: 20,
                  bottom: 0,
                },
                font: {
                  size: 18,
                  family: FONT_FAMILY,
                },
                text: 'Notes: click on the legends below to hide/display the line chart.',
              },
            } as LegendOptions<'line'>,
            title: {
              display: false,
            },
            tooltip: {
              backgroundColor: LIGHT_PURPLE,
              titleColor: 'white',
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
          } as object, // try as PluginOptionsByType<'line'> & object
        } as Defaults,
      } as ChartOptions<'line'>,
    },
    tableData: {
      head: [] as never[],
      rows: [] as never[],
    },
  }
}

export const getVerticalBarsAndLineChartRows = (barData: number[], lineData: number[]) => {
  return [
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
}

export const getHorizontalBarsChartHead = () => {
  return [
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
}

export const getHorizontalBarsChartRows = (chartEntries: ChartEntryHorizontalBar[], rowsSource: RowSource[]) => {
  return [
    ...chartEntries.map((row: ChartEntryHorizontalBar) => {
      return rowsSource.map((rowSource: RowSource) => {
        return {
          text: rowSource.source(row) as number | string,
          classes: 'horizontal-chart-table-row-cell',
        }
      })
    }),
  ]
}

export const createCommentaryChartSettings = (params: {
  elementId: string
  chartTitle: string
  chartEntries: ChartEntryCommentary[]
}) => {
  return {
    title: params.chartTitle,
    chartData: {
      elementId: params.elementId,
      chartEntries: params.chartEntries,
    },
  }
}

export const getUniqueItems = (chartEntries: ChartEntryHorizontalBar[], cell: RowSource) => {
  return Array.from(
    new Set(
      chartEntries.map((row: ChartEntryHorizontalBar) => {
        return cell.source(row) as string
      })
    )
  )
    .sort()
    .map(value => {
      return new DropDownEntry(value, value.toLowerCase().trim().replace(/\W+/g, '-'))
    })
}
