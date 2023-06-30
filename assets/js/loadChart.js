$(window).on('load', function () {
  const element = window.document.getElementById('chart-settings')
  const attributes = element.attributes
  const dataCharSettings = attributes['data-chart-settings'].value
  const chartSettings = JSON.parse(dataCharSettings)

  Object.keys(chartSettings).forEach(chartName => {
    return CHART_COMMANDS.loadChart(chartSettings[chartName].chartData)
  })
})
