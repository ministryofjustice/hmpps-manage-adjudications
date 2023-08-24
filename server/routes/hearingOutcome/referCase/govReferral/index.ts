import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import GovReasonForReferralRoutes from './govReasonForReferral'
import GovReasonForReferralEditRoutes from './govReasonForReferralEdit'

import adjudicationUrls from '../../../../utils/urlGenerator'
import UserService from '../../../../services/userService'
import HearingsService from '../../../../services/hearingsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'
import OutcomesService from '../../../../services/outcomesService'

export default function govReasonForReferralRoutes({
  hearingsService,
  userService,
  reportedAdjudicationsService,
  outcomesService,
}: {
  hearingsService: HearingsService
  userService: UserService
  reportedAdjudicationsService: ReportedAdjudicationsService
  outcomesService: OutcomesService
}): Router {
  const router = express.Router()

  const govReasonForReferralRoute = new GovReasonForReferralRoutes(
    hearingsService,
    userService,
    reportedAdjudicationsService,
    outcomesService
  )
  const GovReasonForReferralEditRoute = new GovReasonForReferralEditRoutes(
    hearingsService,
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
