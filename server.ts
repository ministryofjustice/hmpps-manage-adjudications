// Initialise telemetry before anything else so HTTP, Express and Bunyan are instrumented.
import './server/utils/azureAppInsights'

import app from './server/index'
import logger from './logger'

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})
