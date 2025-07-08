import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../../utils/urlGenerator'
import TotalsAdjudicationsAndLocationsRoutes from './totalsAdjudicationsAndLocations'
import ChartApiService from '../../../services/chartApiService'

export default function totalsAdjudicationsAndLocationsRoutes({
  chartApiService,
}: {
  chartApiService: ChartApiService
}): Router {
  const router = express.Router()

  const route = new TotalsAdjudicationsAndLocationsRoutes(chartApiService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.dataInsights.matchers.start, route.view)

  return router
}
