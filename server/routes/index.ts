import type { Router } from 'express'

import incidentStatementRoutes from './incidentStatement'

export default function routes(router: Router): Router {
  router.use('/incident-statement', incidentStatementRoutes())
  return router
}
