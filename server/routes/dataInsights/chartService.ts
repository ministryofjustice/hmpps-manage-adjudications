import { ChartDataset, ChartOptions, Defaults, LegendOptions, LinearScaleOptions } from 'chart.js'
import {
  ChartDetailsResult,
  ChartEntryCommentary,
  ChartEntryDuoLine,
  ChartEntryHorizontalBar,
  ChartEntryLine,
  ChartEntryVerticalBar,
  DataFilter,
  getMonthShortName,
  RowSource,
  TableHead,
  TableRow,
  TableRowEntry,
} from '../../services/ChartDetailsResult'
import DropDownEntry from './dropDownEntry'

const DARK_BLUE = '#003078'
const DARK_BLUE_DARKER = '#00265f'
const LIGHT_BLUE = '#5694ca'
const LIGHT_BLUE_DARKER = '#4388c4'
const TURQUOISE = '#28a197'
const TURQUOISE_DARKER = '#238d84'
const BLACK = '#0b0c0c'

const FONT_FAMILY = '"GDS Transport",arial,sans-serif'

export const produceVerticalBarsAndLineCharts = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartHint: string,
  chartDetails: ChartDetailsResult,
  yAxisLabel: string
) => {
  const chartEntries = chartDetails.chartEntries as ChartEntryVerticalBar[]

  const labels: string[][] = chartEntries.map((entry: ChartEntryVerticalBar) => {
    return [getMonthShortName(entry.month), ` ${entry.year_curr}`]
  })

  return createVerticalBarsAndLineChartSettings({
    elementId: chartName,
    chartTitle,
    chartHint,
    barData: chartEntries.map((entry: ChartEntryVerticalBar) => entry.count_curr),
    lineData: chartEntries.map((entry: ChartEntryVerticalBar) => entry.count_prev),
    labels,
    head: [],
    rows: getVerticalBarsAndLineChartRows(
      chartEntries.map((entry: ChartEntryVerticalBar) => entry.count_curr),
      chartEntries.map((entry: ChartEntryVerticalBar) => entry.count_prev)
    ),
    yAxisLabel,
  })
}

export const produceMultiVerticalBarsCharts = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartHint: string,
  chartDetails: ChartDetailsResult,
  legendsSource: RowSource,
  yValueSource: RowSource,
  totalCountGroupByKey: RowSource,
  totalCountGroupBySource: RowSource,
  yAxisLabel: string
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

  const totalCountGroupBy: Map<string, number> = chartEntries.reduce(
    (entryMap: Map<string, number>, row: ChartEntryLine) =>
      entryMap.set(
        totalCountGroupByKey.source(row) as string,
        (totalCountGroupBySource.source(row) as number) +
          ((entryMap.get(totalCountGroupByKey.source(row) as string) as number) || 0)
      ),
    new Map<string, number>()
  )

  const legends = Array.from(chartEntriesMap.keys())

  return createMultiVerticalBarsChartSettings({
    elementId: chartName,
    chartTitle,
    chartHint,
    chartEntriesMap,
    yValueSource,
    barColors: ['LIGHT_BLUE', 'DARK_BLUE', 'TURQUOISE'],
    head: [],
    rows: getMultiVerticalBarsRows([
      ...legends.map(legend => {
        return {
          label: legend,
          data: chartEntriesMap
            .get(legend)
            .map((entry: ChartEntryLine) => `${entry.count} ${Math.trunc(entry.proportion * 100)}%`),
        } as TableRowEntry
      }),
      {
        label: 'Total adjudications',
        data:
          legends.length > 0
            ? chartEntriesMap
                .get(legends[0])
                .map((entry: ChartEntryLine) => totalCountGroupBy.get(totalCountGroupByKey.source(entry) as string))
            : [],
      },
    ]),
    yAxisLabel,
  })
}

export const produceDuoVerticalBarsCharts = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartHint: string,
  chartDetails: ChartDetailsResult,
  legendsSource: { label: string; countSource: RowSource; propSource: RowSource }[],
  yValueSource: RowSource,
  totalCountGroupByKey: RowSource,
  totalCountGroupBySource: RowSource,
  yAxisLabel: string
) => {
  const chartEntries = chartDetails.chartEntries as ChartEntryDuoLine[]

  const chartEntriesMap: Map<string, ChartEntryLine[]> = new Map<string, ChartEntryLine[]>()
  const totalCountGroupBy: Map<string, number> = new Map<string, number>()

  chartEntries.forEach((row: ChartEntryDuoLine) => {
    legendsSource.forEach(legend => {
      chartEntriesMap.set(
        legend.label,
        [...(chartEntriesMap.get(legend.label) || [])].concat([
          {
            month: row.month,
            year: row.year,
            count: legend.countSource.source(row),
            proportion: legend.propSource.source(row),
          } as ChartEntryLine,
        ])
      )
    })
    totalCountGroupBy.set(totalCountGroupByKey.source(row) as string, totalCountGroupBySource.source(row) as number)
  })

  const legends = Array.from(chartEntriesMap.keys())

  return createMultiVerticalBarsChartSettings({
    elementId: chartName,
    chartTitle,
    chartHint,
    chartEntriesMap,
    yValueSource,
    barColors: ['DARK_BLUE', 'LIGHT_BLUE'],
    head: [],
    rows: getMultiVerticalBarsRows([
      ...legendsSource.map(legend => {
        return {
          label: legend.label,
          data: chartEntriesMap
            .get(legend.label)
            .map((entry: ChartEntryLine) => `${entry.count} ${Math.trunc(entry.proportion * 100)}%`),
        } as TableRowEntry
      }),
      {
        label: 'Total resolved adjudications',
        data:
          legends.length > 0
            ? chartEntriesMap
                .get(legends[0])
                .map((entry: ChartEntryLine) => totalCountGroupBy.get(totalCountGroupByKey.source(entry) as string))
            : [],
      },
    ]),
    yAxisLabel,
  })
}

export const produceHorizontalBarsChart = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartHint: string,
  chartClarification: string,
  chartDetails: ChartDetailsResult,
  dataFilter: DataFilter,
  labelFieldSource: RowSource,
  barsDataSource: RowSource,
  rowsSource: RowSource[],
  head: TableHead[],
  xAxisLabel: string
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

  const rows = getHorizontalBarsChartRows(chartEntries, rowsSource)

  return createHorizontalBarsChartSettings({
    elementId: chartName,
    chartTitle,
    chartHint,
    chartClarification,
    barData,
    labels,
    xAxisLabel,
    head,
    rows,
  })
}

export const produceCommentaryChart = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartHint: string,
  textBeforeProportion: string,
  textAfterProportion: string,
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
    chartHint,
    textBeforeProportion,
    textAfterProportion,
    chartEntries,
  })
}

export const produceLinesCharts = async (
  chartName: string,
  username: string,
  agencyId: string,
  chartTitle: string,
  chartHint: string,
  chartDetails: ChartDetailsResult,
  dataFilter: DataFilter,
  legendsSource: RowSource,
  yValueSource: RowSource,
  yAxisLabel: string
) => {
  const chartEntries = (chartDetails.chartEntries as ChartEntryLine[]).filter((row: ChartEntryLine) => {
    return dataFilter.filter(row)
  })

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
    chartHint,
    chartEntriesMap,
    yValueSource,
    yAxisLabel,
  })
}

export const createHorizontalBarsChartSettings = (params: {
  elementId: string
  chartTitle: string
  chartHint: string
  chartClarification: string
  barData: number[] | string[]
  xAxisLabel: string
  labels: string[]
  head: TableHead[]
  rows: TableRow[][]
}) => {
  const barsColors = [DARK_BLUE]
  const barsColorsDarker = [DARK_BLUE_DARKER]

  return {
    title: params.chartTitle,
    chartHint: params.chartHint,
    chartClarification: params.chartClarification,
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
                color: BLACK,
              },
              display: true,
              beginAtZero: true,
              ticks: {
                display: true,
                stepSize: 25,
                color: BLACK,
                font: {
                  size: 16,
                  family: FONT_FAMILY,
                  weight: '600',
                },
              },
              grid: {
                display: true,
              },
              title: {
                display: true,
                align: 'end',
                text: params.xAxisLabel,
                color: BLACK,
                font: {
                  size: 16,
                  family: FONT_FAMILY,
                  weight: '400',
                },
                padding: {
                  top: 10,
                },
              },
            } as LinearScaleOptions & object,
            y: {
              display: false,
              ticks: {
                display: false,
              },
              grid: {
                display: false,
              },
            } as LinearScaleOptions & object,
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
            tooltip: tooltipOptions,
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
  chartHint: string
  barData: number[]
  lineData: number[]
  labels: string[][]
  head: TableHead[]
  rows: TableRow[][]
  yAxisLabel: string
}) => {
  const dataLength = params.barData.length
  const barsColors = createCustomArray(dataLength, DARK_BLUE, LIGHT_BLUE)
  const barsColorsDarker = createCustomArray(dataLength, DARK_BLUE_DARKER, LIGHT_BLUE_DARKER)

  return {
    title: params.chartTitle,
    chartHint: params.chartHint,
    chartData: {
      elementId: params.elementId,
      chartOptions: {
        data: {
          datasets: [
            {
              type: 'bar',
              order: 2,
              label: 'This year',
              data: params.barData,
              backgroundColor: barsColors,
              hoverBackgroundColor: barsColorsDarker,
              hoverBorderWidth: 1,
              hoverBorderColor: barsColorsDarker,
            },
            {
              type: 'line',
              order: 1,
              label: 'Previous year',
              data: params.lineData,
              fill: false,
              borderColor: TURQUOISE,
              backgroundColor: TURQUOISE,
              hoverBorderColor: TURQUOISE_DARKER,
              pointBackgroundColor: TURQUOISE,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 1,
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: TURQUOISE_DARKER,
              pointHoverBorderWidth: 3,
              tension: 0,
              borderWidth: 2,
              hoverBorderWidth: 4,
              pointStyle: 'circle',
              font: {
                size: 16,
                family: FONT_FAMILY,
                weight: '600',
              },
            },
            {
              type: 'line',
              order: 3,
              label: 'Current incomplete month',
              data: [] as unknown[],
              fill: false,
              borderColor: LIGHT_BLUE,
              backgroundColor: LIGHT_BLUE,
              tension: 1,
            },
          ],
          labels: params.labels,
        },
        options: {
          hover: {
            mode: 'dataset',
          } as object,
          scales: {
            x: {
              border: {
                color: BLACK,
              },
              display: true,
              ticks: {
                display: true,
                color: BLACK,
                font: {
                  size: 16,
                  family: FONT_FAMILY,
                  weight: '600',
                },
              },
              grid: {
                display: false,
              },
            } as LinearScaleOptions & object,
            y: {
              beginAtZero: true,
              display: true,
              ticks: {
                stepSize: 20,
                color: BLACK,
                font: {
                  size: 20,
                  family: FONT_FAMILY,
                  weight: '400',
                },
              },
              title: {
                display: false,
              },
            } as LinearScaleOptions & object,
          },
          plugins: {
            layout: {
              padding: 30,
            },
            legend: {
              onClick: undefined as undefined,
              position: 'top',
              labels: {
                color: BLACK,
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
              color: BLACK,
              font: {
                size: 30,
                family: FONT_FAMILY,
              },
            },
            tooltip: tooltipOptions,
            customTitle: {
              y: {
                display: true,
                text: params.yAxisLabel,
                left: 0,
                top: 10,
                color: BLACK,
                font: `18px ${FONT_FAMILY}`,
              },
            } as object,
          },
        },
      },
    },
    tableData: {
      head: params.head,
      rows: params.rows,
    },
  }
}

export const createMultiVerticalBarsChartSettings = (params: {
  elementId: string
  chartTitle: string
  chartHint: string
  chartEntriesMap: Map<string, ChartEntryLine[]>
  yValueSource: RowSource
  barColors: ('DARK_BLUE' | 'LIGHT_BLUE' | 'TURQUOISE')[]
  head: TableHead[]
  rows: TableRow[][]
  yAxisLabel: string
}) => {
  const linesLegends = Array.from(params.chartEntriesMap.keys())

  const labels: string[][] =
    linesLegends.length > 0
      ? params.chartEntriesMap.get(linesLegends[0]).map((entry: ChartEntryLine) => {
          return [getMonthShortName(entry.month), ` ${Math.trunc(entry.year)}`]
        })
      : []

  const barsColorsByKey: Map<string, string[]> = new Map([
    ['DARK_BLUE', [DARK_BLUE, DARK_BLUE_DARKER]],
    ['LIGHT_BLUE', [LIGHT_BLUE, LIGHT_BLUE_DARKER]],
    ['TURQUOISE', [TURQUOISE, TURQUOISE_DARKER]],
  ])

  const datasets = linesLegends.map((legend, i) => {
    const chartEntries: ChartEntryLine[] = params.chartEntriesMap.get(legend)
    return {
      type: 'bar',
      order: i + 1,
      label: legend,
      data: chartEntries.map((row: ChartEntryLine) => {
        return params.yValueSource.source(row) as number
      }),
      backgroundColor: barsColorsByKey.get(params.barColors[i])[0],
      hoverBackgroundColor: barsColorsByKey.get(params.barColors[i])[1],
      hoverBorderWidth: 1,
      hoverBorderColor: barsColorsByKey.get(params.barColors[i])[1],
    } as ChartDataset<'bar'> & object
  })

  return {
    title: params.chartTitle,
    chartHint: params.chartHint,
    chartData: {
      elementId: params.elementId,
      chartOptions: {
        data: {
          datasets,
          labels,
        },
        options: {
          hover: {
            mode: 'dataset',
          } as object,
          scales: {
            x: {
              stacked: true,
              border: {
                color: BLACK,
              },
              display: true,
              ticks: {
                display: true,
                color: BLACK,
                font: {
                  size: 16,
                  family: FONT_FAMILY,
                  weight: '600',
                },
              },
              grid: {
                display: false,
              },
            } as LinearScaleOptions & object,
            y: {
              stacked: true,
              beginAtZero: true,
              display: true,
              ticks: {
                stepSize: 20,
                color: BLACK,
                font: {
                  size: 20,
                  family: FONT_FAMILY,
                  weight: '400',
                },
              },
            } as LinearScaleOptions & object,
          },
          plugins: {
            layout: {
              padding: 30,
            },
            legend: {
              onClick: null,
              position: 'top',
              labels: {
                color: BLACK,
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
            },
            tooltip: tooltipOptions,
            customTitle: {
              y: {
                display: true,
                text: params.yAxisLabel,
                left: 0,
                top: 30,
                color: BLACK,
                font: `18px ${FONT_FAMILY}`,
              },
            } as object,
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
  chartHint: string
  chartEntriesMap: Map<string, ChartEntryLine[]>
  yValueSource: RowSource
  yAxisLabel: string
}) => {
  const linesLegends = Array.from(params.chartEntriesMap.keys())

  const labels: string[][] =
    linesLegends.length > 0
      ? params.chartEntriesMap.get(linesLegends[0]).map((entry: ChartEntryLine) => {
          return [getMonthShortName(entry.month), ` ${Math.trunc(entry.year)}`]
        })
      : []

  const head = getMultiLinesChartHead()
  const rows = getMultipleLineChartRows(params.chartEntriesMap, labels)

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
        family: FONT_FAMILY,
        weight: '600',
      },
    } as ChartDataset<'line'> & object
    // ChartDataset<'line'> & LineOptions  & Defaults & PointPrefixedHoverOptions & PointElement & LineOptions & object
  })
  return {
    title: params.chartTitle,
    chartHint: params.chartHint,
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
                color: BLACK,
              },
              display: true,
              ticks: {
                display: true,
                color: BLACK,
                font: {
                  size: 16,
                  family: FONT_FAMILY,
                  weight: '600',
                },
              },
              grid: {
                display: false,
              },
            } as LinearScaleOptions & object,
            y: {
              title: {
                display: false,
                text: 'Count',
                color: BLACK,
                font: {
                  size: 16,
                  family: FONT_FAMILY,
                  weight: '600',
                },
                align: 'end',
              },
              beginAtZero: true,
              offset: true,
              display: true,
              ticks: {
                stepSize: 20,
                color: BLACK,
                font: {
                  size: 20,
                  family: FONT_FAMILY,
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
                color: BLACK,
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
                color: BLACK,
                font: {
                  size: 18,
                  family: FONT_FAMILY,
                },
                text: 'Click on a legend to remove or include the chart line',
              },
            } as LegendOptions<'line'>,
            title: {
              display: false,
            },
            tooltip: tooltipOptions,
            customTitle: {
              y: {
                display: true,
                text: params.yAxisLabel,
                left: 0,
                top: 8,
                color: BLACK,
                font: `18px ${FONT_FAMILY}`,
              },
            } as object,
          } as object, // try as PluginOptionsByType<'line'> & object
        } as Defaults,
      } as ChartOptions<'line'>,
    },
    tableData: {
      head,
      rows,
    },
  }
}

export const getVerticalBarsAndLineChartRows = (barData: number[], lineData: number[]) => {
  return [
    [
      {
        text: 'Number this year',
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
        text: 'Number previous year',
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

export const getMultiVerticalBarsRows = (tableRowEntries: TableRowEntry[]) => {
  return tableRowEntries.map((tableRowEntry: TableRowEntry) => {
    return [
      {
        text: tableRowEntry.label,
        classes: 'multi-vertical-bars-chart-table-head-cell',
      },
      ...tableRowEntry.data.map(value => {
        return {
          text: value,
          classes: 'multi-vertical-bars-chart-table-row-cell',
        }
      }),
    ]
  })
}

export const getTotalsAdjudicationsHorizontalBarsChartHead = () => {
  return [
    {
      text: 'Location',
      classes: 'horizontal-chart-table-head-cell horizontal-chart-table-head-cell-first',
    },
    {
      text: 'Percentage of reports',
      classes: 'horizontal-chart-table-head-cell',
    },
    {
      text: 'Number of reports',
      classes: 'horizontal-chart-table-head-cell',
    },
  ]
}

export const getMultiLinesChartHead = (): TableHead[] => []

export const getMultipleLineChartRows = (
  chartEntriesMap: Map<string, ChartEntryLine[]>,
  monthYearLabels: string[][]
): TableRow[][] => {
  const rows = [] as TableRow[][]
  Array.from(chartEntriesMap.keys()).forEach((key: string) => {
    rows.push([
      {
        text: key,
        classes:
          'multiple-line-table-row-cell multiple-line-table-row-cell-first multiple-line-table-row-cell-header govuk-!-font-weight-bold',
        colspan: 14,
      } as TableRow,
    ])
    rows.push([
      {
        text: '',
        classes: 'multiple-line-table-row-cell multiple-line-table-row-cell-first',
      } as TableRow,
      ...monthYearLabels.map(monthYear => ({
        text: `${monthYear[0]} ${monthYear[1]}`,
        classes: 'multiple-line-table-head-cell',
      })),
    ])
    rows.push([
      {
        text: 'Number',
        classes: 'multiple-line-table-row-cell multiple-line-table-row-cell-first',
      } as TableRow,
      ...chartEntriesMap.get(key).map((entry: ChartEntryLine) => ({
        text: `${entry.count}`,
        classes: 'multiple-line-table-row-cell',
      })),
    ])
    rows.push([
      {
        text: 'Percentage',
        classes: 'multiple-line-table-row-cell multiple-line-table-row-cell-first',
      } as TableRow,
      ...chartEntriesMap.get(key).map((entry: ChartEntryLine) => ({
        text: `${Math.trunc(entry.proportion * 100)}%`,
        classes: 'multiple-line-table-row-cell',
      })),
    ])
  })
  return rows
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
  chartHint: string
  textBeforeProportion: string
  textAfterProportion: string
  chartEntries: ChartEntryCommentary[]
}) => {
  return {
    title: params.chartTitle,
    chartHint: params.chartHint,
    textBeforeProportion: params.textBeforeProportion,
    textAfterProportion: params.textAfterProportion,
    chartData: {
      elementId: params.elementId,
      chartEntries: params.chartEntries,
    },
  }
}

const tooltipOptions = {
  backgroundColor: '#d9d9d9',
  cornerRadius: 0,
  titleColor: BLACK,
  titleAlign: 'left',
  titleSpacing: 2,
  titleMarginBottom: 6,
  titleFont: {
    size: 18,
    family: FONT_FAMILY,
  },
  padding: 10,
  bodyColor: BLACK,
  bodySpacing: 2,
  bodyFont: {
    size: 14,
    family: FONT_FAMILY,
  },
}

export const createCustomArray = (size: number, mainValue: string, lastValue: string): string[] => [
  ...[...Array(Math.max(size - 1, 0))].map(() => mainValue),
  lastValue,
]

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
