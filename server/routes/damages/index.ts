import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import DamagesSessionService from '../../services/damagesSessionService'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import DetailsOfDamagesPage, { PageRequestType } from './detailsOfDamages'
import AddDamagesRoutes from './addDamages'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function detailsOfDamagesRoutes({
  placeOnReportService,
  damagesSessionService,
  reportedAdjudicationsService,
}: {
  placeOnReportService: PlaceOnReportService
  damagesSessionService: DamagesSessionService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const detailsOfDamagesUsingDraft = new DetailsOfDamagesPage(
    PageRequestType.DAMAGES_FROM_API,
    placeOnReportService,
    damagesSessionService,
    reportedAdjudicationsService
  )

  const detailsOfDamagesUsingSession = new DetailsOfDamagesPage(
    PageRequestType.DAMAGES_FROM_SESSION,
    placeOnReportService,
    damagesSessionService,
    reportedAdjudicationsService
  )

  const submittedEditDetailsOfDamagesUsingDraft = new DetailsOfDamagesPage(
    PageRequestType.SUBMITTED_EDIT_DAMAGES_FROM_API,
    placeOnReportService,
    damagesSessionService,
    reportedAdjudicationsService
  )

  const submittedEditDetailsOfDamagesUsingSession = new DetailsOfDamagesPage(
    PageRequestType.SUBMITTED_EDIT_DAMAGES_FROM_SESSION,
    placeOnReportService,
    damagesSessionService,
    reportedAdjudicationsService
  )

  const addDamage = new AddDamagesRoutes(damagesSessionService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.detailsOfDamages.matchers.start, detailsOfDamagesUsingDraft.view)
  post(adjudicationUrls.detailsOfDamages.matchers.start, detailsOfDamagesUsingDraft.submit)
  get(adjudicationUrls.detailsOfDamages.matchers.modified, detailsOfDamagesUsingSession.view)
  post(adjudicationUrls.detailsOfDamages.matchers.modified, detailsOfDamagesUsingSession.submit)
  get(adjudicationUrls.detailsOfDamages.matchers.add, addDamage.view)
  post(adjudicationUrls.detailsOfDamages.matchers.add, addDamage.submit)
  get(adjudicationUrls.detailsOfDamages.matchers.submittedEdit, submittedEditDetailsOfDamagesUsingDraft.view)
  post(adjudicationUrls.detailsOfDamages.matchers.submittedEdit, submittedEditDetailsOfDamagesUsingDraft.submit)
  get(adjudicationUrls.detailsOfDamages.matchers.submittedEditModified, submittedEditDetailsOfDamagesUsingSession.view)
  post(
    adjudicationUrls.detailsOfDamages.matchers.submittedEditModified,
    submittedEditDetailsOfDamagesUsingSession.submit
  )

  return router
}
