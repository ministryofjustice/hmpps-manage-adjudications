import express, { RequestHandler, Router } from 'express'

import PlaceOnReportService from '../../services/placeOnReportService'
import DecisionTreeService from '../../services/decisionTreeService'
import AddOffenceRoutes from './addOffence'
import DeleteOffenceRoutes from './deleteOffence'
import adjudicationUrls from '../../utils/urlGenerator'
import DetailsOfOffencePage, { PageRequestType } from './detailsOfOffence'

export default function detailsOfOffenceRoutes({
  placeOnReportService,
  decisionTreeService,
}: {
  placeOnReportService: PlaceOnReportService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const detailsOfOffenceUsingDraft = new DetailsOfOffencePage(
    PageRequestType.OFFENCES_FROM_API,
    placeOnReportService,
    decisionTreeService,
  )

  const detailsOfOffenceUsingSession = new DetailsOfOffencePage(
    PageRequestType.OFFENCES_FROM_SESSION,
    placeOnReportService,
    decisionTreeService,
  )

  const detailsOfOffenceUsingSessionAloEdit = new DetailsOfOffencePage(
    PageRequestType.OFFENCES_FROM_SESSION_ALO_EDIT,
    placeOnReportService,
    decisionTreeService,
  )

  const addOffence = new AddOffenceRoutes()

  const deleteOffence = new DeleteOffenceRoutes(decisionTreeService, placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.detailsOfOffence.matchers.add, addOffence.add)
  get(adjudicationUrls.detailsOfOffence.matchers.aloAdd, addOffence.aloAdd)
  get(adjudicationUrls.detailsOfOffence.matchers.start, detailsOfOffenceUsingDraft.view)
  post(adjudicationUrls.detailsOfOffence.matchers.start, detailsOfOffenceUsingDraft.submit)
  get(adjudicationUrls.detailsOfOffence.matchers.modified, detailsOfOffenceUsingSession.view)
  post(adjudicationUrls.detailsOfOffence.matchers.modified, detailsOfOffenceUsingSession.submit)
  get(adjudicationUrls.detailsOfOffence.matchers.aloEdit, detailsOfOffenceUsingSessionAloEdit.view)
  post(adjudicationUrls.detailsOfOffence.matchers.aloEdit, detailsOfOffenceUsingSessionAloEdit.submit)
  get(adjudicationUrls.detailsOfOffence.matchers.delete, deleteOffence.view)
  post(adjudicationUrls.detailsOfOffence.matchers.delete, deleteOffence.submit)

  return router
}
