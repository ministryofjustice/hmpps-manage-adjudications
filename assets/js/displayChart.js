const CHART_COMMANDS = (function () {
  const storage = {}

  const loadChart = chartSettings => {
    const elementId = chartSettings.elementId
    const elementById = window.document.getElementById(elementId)

    const chartOptions = chartSettings.chartOptions
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
