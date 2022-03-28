import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import DetailsOfOffenceRoutes from './detailsOfOffence'
import PlaceOnReportService from '../../services/placeOnReportService'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import DecisionTreeService from '../../services/decisionTreeService'
import AddOffenceRoutes from './addOffence'
import DeleteOffenceRoutes from './deleteOffence'

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

  const detailsOfOffence = new DetailsOfOffenceRoutes(
    placeOnReportService,
    allOffencesSessionService,
    decisionTreeService
  )

  const addOffence = new AddOffenceRoutes(placeOnReportService, allOffencesSessionService)

  const deleteOffence = new DeleteOffenceRoutes(allOffencesSessionService, decisionTreeService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/add', addOffence.add)
  get('/:adjudicationNumber', detailsOfOffence.view)
  post('/:adjudicationNumber', detailsOfOffence.submit)
  get('/:adjudicationNumber/delete/:offenceIndex', deleteOffence.view)
  post('/:adjudicationNumber/delete/:offenceIndex', deleteOffence.submit)

  return router
}
