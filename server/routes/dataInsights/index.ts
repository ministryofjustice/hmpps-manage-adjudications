import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import adjudicationUrls from '../../utils/urlGenerator'
import DataInsightsRoutes from './dataInsights'
import ChartService from '../../services/chartService'

export default function dataInsightsRoutes({ chartService }: { chartService: ChartService }): Router {
  const router = express.Router()

  const dataInsightsRoute = new DataInsightsRoutes(chartService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.dataInsights.matchers.start, dataInsightsRoute.view)

  return router
}
