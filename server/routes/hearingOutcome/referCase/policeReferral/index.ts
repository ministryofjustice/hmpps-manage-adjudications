import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import PoliceReasonForReferralRoutes from './policeReasonForReferral'
import PoliceReasonForReferralEditRoutes from './policeReasonForReferralEdit'

import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import OutcomesService from '../../../../services/outcomesService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default function policeReasonForReferralRoutes({
  outcomesService,
  userService,
  reportedAdjudicationsService,
}: {
  outcomesService: OutcomesService
  userService: UserService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const policeReasonForReferralRoute = new PoliceReasonForReferralRoutes(
    outcomesService,
    userService,
    reportedAdjudicationsService
  )

  const policeReasonForReferralEditRoute = new PoliceReasonForReferralEditRoutes(
    outcomesService,
    userService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.reasonForReferral.matchers.start, policeReasonForReferralRoute.view)
  post(adjudicationUrls.reasonForReferral.matchers.start, policeReasonForReferralRoute.submit)
  get(adjudicationUrls.reasonForReferral.matchers.edit, policeReasonForReferralEditRoute.view)
  post(adjudicationUrls.reasonForReferral.matchers.edit, policeReasonForReferralEditRoute.submit)

  return router
}
