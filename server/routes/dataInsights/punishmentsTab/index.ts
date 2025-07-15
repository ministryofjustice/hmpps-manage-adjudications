import express, { RequestHandler, Router } from 'express'
import adjudicationUrls from '../../../utils/urlGenerator'
import ChartApiService from '../../../services/chartApiService'
import PunishmentsRoutes from './punishments'

export default function punishmentsRoutes({ chartApiService }: { chartApiService: ChartApiService }): Router {
  const router = express.Router()

  const route = new PunishmentsRoutes(chartApiService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.dataInsights.matchers.start, route.view)
  post(adjudicationUrls.dataInsights.matchers.start, route.submit)

  return router
}
