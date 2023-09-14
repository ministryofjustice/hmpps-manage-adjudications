import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import adjudicationUrls from '../../utils/urlGenerator'
import CheckCreateOnBehalfOfRoutes from './checkCreateOnBehalfOf'
import PlaceOnReportService from '../../services/placeOnReportService'
import CreateOnBehalfOfRoutes from './createOnBehalfOf'
import CreateOnBehalfOfReasonRoutes from './createOnBehalfOfReason'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default function createOnBehalfOfRoutes({
  placeOnReportService,
  createOnBehalfOfSessionService,
}: {
  placeOnReportService: PlaceOnReportService
  createOnBehalfOfSessionService: CreateOnBehalfOfSessionService
}): Router {
  const router = express.Router()

  const createOnBehalfOfRoute = new CreateOnBehalfOfRoutes(createOnBehalfOfSessionService)
  const createOnBehalfOfReasonRoute = new CreateOnBehalfOfReasonRoutes(createOnBehalfOfSessionService)
  const checkCreateOnBehalfOfRoute = new CheckCreateOnBehalfOfRoutes(
    placeOnReportService,
    createOnBehalfOfSessionService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.createOnBehalfOf.matchers.start, createOnBehalfOfRoute.view)
  post(adjudicationUrls.createOnBehalfOf.matchers.start, createOnBehalfOfRoute.submit)
  get(adjudicationUrls.createOnBehalfOf.matchers.reason, createOnBehalfOfReasonRoute.view)
  post(adjudicationUrls.createOnBehalfOf.matchers.reason, createOnBehalfOfReasonRoute.submit)
  get(adjudicationUrls.createOnBehalfOf.matchers.check, checkCreateOnBehalfOfRoute.view)
  post(adjudicationUrls.createOnBehalfOf.matchers.check, checkCreateOnBehalfOfRoute.submit)

  return router
}
