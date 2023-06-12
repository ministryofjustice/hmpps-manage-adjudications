import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import adjudicationUrls from '../../../utils/urlGenerator'
import ChartService from '../../../services/chartService'
import PunishmentsRoutes from './punishments'

export default function punishmentsRoutes({ chartService }: { chartService: ChartService }): Router {
  const router = express.Router()

  const route = new PunishmentsRoutes(chartService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.dataInsights.matchers.start, route.view)

  return router
}
