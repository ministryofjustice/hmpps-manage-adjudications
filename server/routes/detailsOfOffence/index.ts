import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import DetailsOfOffenceRoutes from './detailsOfOffence'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import DecisionTreeService from '../../services/decisionTreeService'

export default function detailsOfOffenceRoutes({
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

  const detailsOfOffence = new DetailsOfOffenceRoutes(
    placeOnReportService,
    userService,
    allOffencesSessionService,
    decisionTreeService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/add', detailsOfOffence.addOffence)
  get('/:adjudicationNumber/delete/:index', detailsOfOffence.deleteOffence)
  get('/:adjudicationNumber', detailsOfOffence.view)
  post('/:adjudicationNumber', detailsOfOffence.submit)

  return router
}
