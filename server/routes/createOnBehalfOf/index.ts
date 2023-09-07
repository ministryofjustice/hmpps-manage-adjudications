import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'
import CheckCreateOnBehalfOfRoutes from './checkCreateOnBehalfOf'
import PlaceOnReportService from '../../services/placeOnReportService'

export default function createOnBehalfOfRoutes({
  decisionTreeService,
  placeOnReportService,
}: {
  decisionTreeService: DecisionTreeService
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const checkCreateOnBehalfOfRoute = new CheckCreateOnBehalfOfRoutes(decisionTreeService, placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.createOnBehalfOf.matchers.check, checkCreateOnBehalfOfRoute.view)
  post(adjudicationUrls.createOnBehalfOf.matchers.check, checkCreateOnBehalfOfRoute.submit)
  return router
}
