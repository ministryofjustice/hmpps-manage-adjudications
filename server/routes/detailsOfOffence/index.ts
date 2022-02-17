import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import DetailsOfOffenceRoutes from './detailsOfOffence'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'

export default function detailsOfOffenceRoutes({
  placeOnReportService,
  userService,
}: {
  placeOnReportService: PlaceOnReportService
  userService: UserService
}): Router {
  const router = express.Router()

  const detailsOfOffence = new DetailsOfOffenceRoutes(placeOnReportService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/add', detailsOfOffence.addOffence)
  get('/:adjudicationNumber', detailsOfOffence.view)

  return router
}
