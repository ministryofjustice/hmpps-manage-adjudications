import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import DetailsOfOffenceRoutes from './detailsOfOffence'
import PlaceOnReportService from '../../services/placeOnReportService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import DecisionTreeService from '../../services/decisionTreeService'
import AddOffenceRoutes from './addOffence'
import DeleteOffenceRoutes from './deleteOffence'
import { detailsOfOffence } from '../../utils/urlGenerator'

export default function detailsOfOffenceRoutes({
  placeOnReportService,
  allOffencesSessionService,
  decisionTreeService,
}: {
  placeOnReportService: PlaceOnReportService
  allOffencesSessionService: AllOffencesSessionService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const detailsOfOffenceRoute = new DetailsOfOffenceRoutes(
    placeOnReportService,
    allOffencesSessionService,
    decisionTreeService
  )

  const addOffence = new AddOffenceRoutes(placeOnReportService, allOffencesSessionService)

  const deleteOffence = new DeleteOffenceRoutes(allOffencesSessionService, decisionTreeService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(detailsOfOffence.matchers.add, addOffence.add)
  get(detailsOfOffence.matchers.start, detailsOfOffenceRoute.view)
  post(detailsOfOffence.matchers.start, detailsOfOffenceRoute.submit)
  get(detailsOfOffence.matchers.delete, deleteOffence.view)
  post(detailsOfOffence.matchers.delete, deleteOffence.submit)

  return router
}
