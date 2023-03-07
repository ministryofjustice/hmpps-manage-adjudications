import express, { RequestHandler, Router } from 'express'
import NotProceedRoutes from './notProceed'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import adjudicationUrls from '../../utils/urlGenerator'
import UserService from '../../services/userService'
import OutcomesService from '../../services/outcomesService'
import NotProceedCompleteHearingRoutes from './notProceedCompleteHearing'
import HearingsService from '../../services/hearingsService'

export default function notProceedRoutes({
  userService,
  outcomesService,
  hearingsService,
}: {
  userService: UserService
  outcomesService: OutcomesService
  hearingsService: HearingsService
}): Router {
  const router = express.Router()

  const notProceedRoute = new NotProceedRoutes(userService, outcomesService, hearingsService)
  const notProceedCompleteHearingRoute = new NotProceedCompleteHearingRoutes(
    userService,
    outcomesService,
    hearingsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reasonForNotProceeding.matchers.start, notProceedRoute.view)
  post(adjudicationUrls.reasonForNotProceeding.matchers.start, notProceedRoute.submit)
  get(adjudicationUrls.reasonForNotProceeding.matchers.completeHearingStart, notProceedCompleteHearingRoute.view)
  post(adjudicationUrls.reasonForNotProceeding.matchers.completeHearingStart, notProceedCompleteHearingRoute.submit)

  return router
}
