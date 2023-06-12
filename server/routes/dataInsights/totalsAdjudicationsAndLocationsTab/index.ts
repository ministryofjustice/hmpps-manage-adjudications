import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import adjudicationUrls from '../../../utils/urlGenerator'
import TotalsAdjudicationsAndLocationsRoutes from './totalsAdjudicationsAndLocations'
import ChartService from '../../../services/chartService'

export default function totalsAdjudicationsAndLocationsRoutes({
  chartService,
}: {
  chartService: ChartService
}): Router {
  const router = express.Router()

  const route = new TotalsAdjudicationsAndLocationsRoutes(chartService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.dataInsights.matchers.start, route.view)

  return router
}
