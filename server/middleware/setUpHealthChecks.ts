import express, { Router } from 'express'

import { monitoringMiddleware, endpointHealthComponent } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import logger from '../../logger'
import config from '../config'

// Optional services: the application works without them, so they must not mark the service as down.
// Curious only adds learning needs to the printed notice of report, and its failures are already handled.
export const apisExcludedFromHealthCheck = ['curious']

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis).filter(([name]) => !apisExcludedFromHealthCheck.includes(name))

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: apiConfig.map(([name, options]) => endpointHealthComponent(logger, name, options)),
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
