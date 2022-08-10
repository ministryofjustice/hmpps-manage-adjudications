import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import DamagesSessionService from '../../services/damagesSessionService'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import DetailsOfDamagesPage, { PageRequestType } from './detailsOfDamages'
import AddDamagesRoutes from './addDamages'

export default function detailsOfOffenceRoutes({
  placeOnReportService,
  damagesSessionService,
}: {
  placeOnReportService: PlaceOnReportService
  damagesSessionService: DamagesSessionService
}): Router {
  const router = express.Router()

  const detailsOfDamagesUsingDraft = new DetailsOfDamagesPage(
    PageRequestType.DAMAGES_FROM_API,
    placeOnReportService,
    damagesSessionService
  )

  const detailsOfDamagesUsingSession = new DetailsOfDamagesPage(
    PageRequestType.DAMAGES_FROM_SESSION,
    placeOnReportService,
    damagesSessionService
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

  return router
}
