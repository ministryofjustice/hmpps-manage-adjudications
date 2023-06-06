import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import adjudicationUrls from '../../utils/urlGenerator'
import DataInsightsRoutes from './dataInsights'

export default function dataInsightsRoutes(): Router {
  const router = express.Router()

  const dataInsightsRoute = new DataInsightsRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.dataInsights.matchers.start, dataInsightsRoute.view)

  return router
}
