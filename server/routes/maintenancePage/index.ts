import express, { RequestHandler, Router } from 'express'

import MaintenanceRoutes from './maintenancePage'
import adjudicationUrls from '../../utils/urlGenerator'

export default function maintenancePageRoutes(): Router {
  const router = express.Router()
  const maintenancePage = new MaintenanceRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  get('/', async (req, res) => res.redirect(adjudicationUrls.maintenancePage.root))
  get(adjudicationUrls.maintenancePage.root, maintenancePage.view)
  return router
}
