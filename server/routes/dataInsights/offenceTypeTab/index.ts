import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../../utils/urlGenerator'
import ChartApiService from '../../../services/chartApiService'
import OffenceTypeRoutes from './offenceType'

export default function offenceTypeRoutes({ chartApiService }: { chartApiService: ChartApiService }): Router {
  const router = express.Router()

  const route = new OffenceTypeRoutes(chartApiService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.dataInsights.matchers.start, route.view)
  post(adjudicationUrls.dataInsights.matchers.start, route.submit)

  return router
}
