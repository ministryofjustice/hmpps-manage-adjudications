import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import adjudicationUrls from '../../../utils/urlGenerator'
import ChartService from '../../../services/chartService'
import OffenceTypeRoutes from './offenceType'

export default function offenceTypeRoutes({ chartService }: { chartService: ChartService }): Router {
  const router = express.Router()

  const route = new OffenceTypeRoutes(chartService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.dataInsights.matchers.start, route.view)

  return router
}
