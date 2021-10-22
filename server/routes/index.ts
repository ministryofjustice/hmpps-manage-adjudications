import type { Router } from 'express'

import incidentStatementRoutes from './incidentStatement'

export default function routes(router: Router): Router {
  router.use('/incident-statement', incidentStatementRoutes())
  router.get('/', (req, res, next) => res.render('pages/index'))
  return router
}
