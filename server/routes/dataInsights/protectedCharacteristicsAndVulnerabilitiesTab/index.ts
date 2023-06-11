import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'
import adjudicationUrls from '../../../utils/urlGenerator'
import ChartService from '../../../services/chartService'
import ProtectedCharacteristicsAndVulnerabilitiesRoutes from './protectedCharacteristicsAndVulnerabilities'

export default function protectedCharacteristicsAndVulnerabilitiesRoutes({
  chartService,
}: {
  chartService: ChartService
}): Router {
  const router = express.Router()

  const route = new ProtectedCharacteristicsAndVulnerabilitiesRoutes(chartService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.dataInsights.matchers.start, route.view)

  return router
}
