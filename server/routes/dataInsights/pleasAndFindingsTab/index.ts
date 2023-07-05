import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import adjudicationUrls from '../../../utils/urlGenerator'
import ChartApiService from '../../../services/chartApiService'
import PleasAndFindingsRoutes from './pleasAndFindings'

export default function pleasAndFindingsRoutes({ chartApiService }: { chartApiService: ChartApiService }): Router {
  const router = express.Router()

  const route = new PleasAndFindingsRoutes(chartApiService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.dataInsights.matchers.start, route.view)

  return router
}
