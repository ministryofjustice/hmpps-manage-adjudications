import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import GovReasonForReferralRoutes from './govReasonForReferral'
import GovReasonForReferralEditRoutes from './govReasonForReferralEdit'

import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import OutcomesService from '../../../../services/outcomesService'

export default function govReasonForReferralRoutes({
  userService,
  reportedAdjudicationsService,
  outcomesService,
}: {
  userService: UserService
  reportedAdjudicationsService: ReportedAdjudicationsService
  outcomesService: OutcomesService
}): Router {
  const router = express.Router()

  const govReasonForReferralRoute = new GovReasonForReferralRoutes(
    userService,
    reportedAdjudicationsService,
    outcomesService
  )
  const GovReasonForReferralEditRoute = new GovReasonForReferralEditRoutes(
    userService,
    reportedAdjudicationsService,
    outcomesService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.govReasonForReferral.matchers.start, govReasonForReferralRoute.view)
  post(adjudicationUrls.govReasonForReferral.matchers.start, govReasonForReferralRoute.submit)
  get(adjudicationUrls.govReasonForReferral.matchers.edit, GovReasonForReferralEditRoute.view)
  post(adjudicationUrls.govReasonForReferral.matchers.edit, GovReasonForReferralEditRoute.submit)

  return router
}
