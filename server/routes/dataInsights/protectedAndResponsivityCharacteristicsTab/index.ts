import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import adjudicationUrls from '../../../utils/urlGenerator'
import ChartApiService from '../../../services/chartApiService'
import ProtectedAndResponsivityCharacteristicsRoutes from './protectedAndResponsivityCharacteristics'

export default function protectedAndResponsivityCharacteristicsRoutes({
  chartApiService,
}: {
  chartApiService: ChartApiService
}): Router {
  const router = express.Router()

  const route = new ProtectedAndResponsivityCharacteristicsRoutes(chartApiService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.dataInsights.matchers.start, route.view)
  post(adjudicationUrls.dataInsights.matchers.start, route.submit)

  return router
}
