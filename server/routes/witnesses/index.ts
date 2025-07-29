import express, { RequestHandler, Router } from 'express'
import WitnessesSessionService from '../../services/witnessesSessionService'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import DetailsOfWitnessesPage, { PageRequestType } from './detailsOfWitnesses'
import AddWitnessRoutes from './addWitness'
import UserService from '../../services/userService'
import DecisionTreeService from '../../services/decisionTreeService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function detailsOfWitnessesRoutes({
  placeOnReportService,
  witnessesSessionService,
  userService,
  decisionTreeService,
  reportedAdjudicationsService,
}: {
  placeOnReportService: PlaceOnReportService
  witnessesSessionService: WitnessesSessionService
  userService: UserService
  decisionTreeService: DecisionTreeService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const detailsOfWitnessesUsingDraft = new DetailsOfWitnessesPage(
    PageRequestType.WITNESSES_FROM_API,
    placeOnReportService,
    witnessesSessionService,
    reportedAdjudicationsService,
  )

  const detailsOfWitnessesUsingSession = new DetailsOfWitnessesPage(
    PageRequestType.WITNESSES_FROM_SESSION,
    placeOnReportService,
    witnessesSessionService,
    reportedAdjudicationsService,
  )

  const submittedEditDetailsOfWitnessesUsingDraft = new DetailsOfWitnessesPage(
    PageRequestType.SUBMITTED_EDIT_WITNESSES_FROM_API,
    placeOnReportService,
    witnessesSessionService,
    reportedAdjudicationsService,
  )

  const submittedEditDetailsOfWitnessesUsingSession = new DetailsOfWitnessesPage(
    PageRequestType.SUBMITTED_EDIT_WITNESSES_FROM_SESSION,
    placeOnReportService,
    witnessesSessionService,
    reportedAdjudicationsService,
  )

  const addWitness = new AddWitnessRoutes(
    witnessesSessionService,
    placeOnReportService,
    userService,
    decisionTreeService,
    reportedAdjudicationsService,
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.detailsOfWitnesses.matchers.start, detailsOfWitnessesUsingDraft.view)
  post(adjudicationUrls.detailsOfWitnesses.matchers.start, detailsOfWitnessesUsingDraft.submit)
  get(adjudicationUrls.detailsOfWitnesses.matchers.modified, detailsOfWitnessesUsingSession.view)
  post(adjudicationUrls.detailsOfWitnesses.matchers.modified, detailsOfWitnessesUsingSession.submit)
  get(adjudicationUrls.detailsOfWitnesses.matchers.add, addWitness.view)
  post(adjudicationUrls.detailsOfWitnesses.matchers.add, addWitness.submit)
  get(adjudicationUrls.detailsOfWitnesses.matchers.submittedEdit, submittedEditDetailsOfWitnessesUsingDraft.view)
  post(adjudicationUrls.detailsOfWitnesses.matchers.submittedEdit, submittedEditDetailsOfWitnessesUsingDraft.submit)
  get(
    adjudicationUrls.detailsOfWitnesses.matchers.submittedEditModified,
    submittedEditDetailsOfWitnessesUsingSession.view,
  )
  post(
    adjudicationUrls.detailsOfWitnesses.matchers.submittedEditModified,
    submittedEditDetailsOfWitnessesUsingSession.submit,
  )

  return router
}
