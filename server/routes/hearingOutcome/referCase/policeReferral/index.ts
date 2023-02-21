import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import PoliceReasonForReferralRoutes from './policeReasonForReferral'

import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import OutcomesService from '../../../../services/outcomesService'

export default function policeReasonForReferralRoutes({
  outcomesService,
  userService,
}: {
  outcomesService: OutcomesService
  userService: UserService
}): Router {
  const router = express.Router()

  const policeReasonForReferralRoute = new PoliceReasonForReferralRoutes(outcomesService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reasonForReferral.matchers.start, policeReasonForReferralRoute.view)
  post(adjudicationUrls.reasonForReferral.matchers.start, policeReasonForReferralRoute.submit)

  return router
}
