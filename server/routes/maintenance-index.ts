import type { Router } from 'express'
import maintenancePageRoutes from './maintenancePage'

export default function routes(router: Router): Router {
  router.use('/', maintenancePageRoutes())
  return router
}
