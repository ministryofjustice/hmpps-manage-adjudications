import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import adjudicationUrls from '../../utils/urlGenerator'
import DecisionTreeService from '../../services/decisionTreeService'
import CheckCreateOnBehalfOfRoutes from './checkCreateOnBehalfOf'

export default function createOnBehalfOfRoutes({
  decisionTreeService,
}: {
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const checkCreateOnBehalfOfRoute = new CheckCreateOnBehalfOfRoutes(decisionTreeService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.createOnBehalfOf.matchers.check, checkCreateOnBehalfOfRoute.view)
  post(adjudicationUrls.createOnBehalfOf.matchers.check, checkCreateOnBehalfOfRoute.submit)
  return router
}
