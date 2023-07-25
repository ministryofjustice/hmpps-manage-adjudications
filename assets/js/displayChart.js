const CHART_COMMANDS = (function () {
  const storage = {}

  const loadChart = chartSettings => {
    const elementId = chartSettings.elementId
    const elementById = window.document.getElementById(elementId)

    const chartOptions = chartSettings.chartOptions

    if (chartOptions?.options?.plugins?.customTitle) {
      if (chartOptions.plugins === undefined) {
        chartOptions.plugins = []
      }
      if (
        chartOptions.plugins.length === 0 ||
        chartOptions.plugins.filter(plugin => plugin.id === 'customTitle').length === 0
      ) {
        chartOptions.plugins.push({
          id: 'customTitle',
          afterDraw(chart, args, opts) {
            if (opts.y?.display) {
              const { ctx } = chart
              if (opts.y.font) {
                ctx.font = opts.y.font
              }
              if (opts.y.color) {
                ctx.fillStyle = opts.y.color
              }
              if (opts.y.text) {
                ctx.fillText(opts.y.text, opts.y.left || 0, opts.y.top || 0)
              }
            }
          },
        })
      }
    }
    const chart = new Chart(elementById, chartOptions)
    if (storage[elementId]) {
      console.error('Chart already initialised', elementById)
    }
    storage[elementId] = chart
  }

  return {
    loadChart: loadChart,
  }
})()
