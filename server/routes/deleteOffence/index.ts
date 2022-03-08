import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import DecisionTreeService from '../../services/decisionTreeService'
import DeleteOffenceRoutes from './deleteOffence'

export default function deleteOffenceRoutes({
  placeOnReportService,
  userService,
  allOffencesSessionService,
  decisionTreeService,
}: {
  placeOnReportService: PlaceOnReportService
  userService: UserService
  allOffencesSessionService: AllOffencesSessionService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const detailsOfOffence = new DeleteOffenceRoutes(
    placeOnReportService,
    userService,
    allOffencesSessionService,
    decisionTreeService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/:index', detailsOfOffence.view)
  post('/:adjudicationNumber/:index', detailsOfOffence.submit)

  return router
}
