import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import WitnessesSessionService from '../../services/witnessesSessionService'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import DetailsOfWitnessesPage, { PageRequestType } from './detailsOfWitnesses'
import AddWitnessRoutes from './addWitness'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'

export default function detailsOfWitnessesRoutes({
  placeOnReportService,
  witnessesSessionService,
  userService,
  decisionTreeService,
}: {
  placeOnReportService: PlaceOnReportService
  witnessesSessionService: WitnessesSessionService
  userService: UserService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const detailsOfWitnessesUsingDraft = new DetailsOfWitnessesPage(
    PageRequestType.WITNESSES_FROM_API,
    placeOnReportService,
    witnessesSessionService
  )

  const detailsOfWitnessesUsingSession = new DetailsOfWitnessesPage(
    PageRequestType.WITNESSES_FROM_SESSION,
    placeOnReportService,
    witnessesSessionService
  )

  const addWitness = new AddWitnessRoutes(
    witnessesSessionService,
    placeOnReportService,
    userService,
    decisionTreeService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.detailsOfWitnesses.matchers.start, detailsOfWitnessesUsingDraft.view)
  post(adjudicationUrls.detailsOfWitnesses.matchers.start, detailsOfWitnessesUsingDraft.submit)
  get(adjudicationUrls.detailsOfWitnesses.matchers.modified, detailsOfWitnessesUsingSession.view)
  post(adjudicationUrls.detailsOfWitnesses.matchers.modified, detailsOfWitnessesUsingSession.submit)
  get(adjudicationUrls.detailsOfWitnesses.matchers.add, addWitness.view)
  post(adjudicationUrls.detailsOfWitnesses.matchers.add, addWitness.submit)

  return router
}
