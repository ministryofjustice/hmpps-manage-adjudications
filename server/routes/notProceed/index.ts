import express, { RequestHandler, Router } from 'express'
import NotProceedRoutes from './notProceed'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import OutcomesService from '../../services/outcomesService'
import NotProceedCompleteHearingRoutes from './notProceedCompleteHearing'
import NotProceedCompleteHearingEditRoutes from './notProceedCompleteHearingEdit'
import HearingsService from '../../services/hearingsService'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function notProceedRoutes({
  userService,
  outcomesService,
  hearingsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  outcomesService: OutcomesService
  hearingsService: HearingsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const notProceedRoute = new NotProceedRoutes(
    userService,
    outcomesService,
    hearingsService,
    reportedAdjudicationsService
  )
  const notProceedCompleteHearingRoute = new NotProceedCompleteHearingRoutes(
    userService,
    outcomesService,
    hearingsService,
    reportedAdjudicationsService
  )

  const notProceedCompleteHearingEditRoute = new NotProceedCompleteHearingEditRoutes(
    userService,
    outcomesService,
    hearingsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reasonForNotProceeding.matchers.start, notProceedRoute.view)
  post(adjudicationUrls.reasonForNotProceeding.matchers.start, notProceedRoute.submit)
  get(adjudicationUrls.reasonForNotProceeding.matchers.completeHearingStart, notProceedCompleteHearingRoute.view)
  post(adjudicationUrls.reasonForNotProceeding.matchers.completeHearingStart, notProceedCompleteHearingRoute.submit)
  get(adjudicationUrls.reasonForNotProceeding.matchers.completeHearingEdit, notProceedCompleteHearingEditRoute.view)
  post(adjudicationUrls.reasonForNotProceeding.matchers.completeHearingEdit, notProceedCompleteHearingEditRoute.submit)

  return router
}
