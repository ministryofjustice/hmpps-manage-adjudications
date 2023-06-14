$(window).on('load', function () {
  const element = window.document.getElementById('chart-settings')
  const attributes = element.attributes
  const dataCharSettings = attributes['data-chart-settings'].value
  const chartSettings = JSON.parse(dataCharSettings)

  if (Array.isArray(chartSettings)) {
    CHART_COMMANDS.loadCharts(chartSettings)
  } else {
    CHART_COMMANDS.loadChart(chartSettings)
  }
})
