import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import HearingReasonForReferralRoutes from './hearingReasonForReferral'
import HearingReasonForReferralEditRoutes from './hearingReasonForReferralEdit'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'

export default function hearingReasonForReferralRoutes({
  hearingsService,
  userService,
}: {
  hearingsService: HearingsService
  userService: UserService
}): Router {
  const router = express.Router()

  const hearingReasonForReferralRoute = new HearingReasonForReferralRoutes(hearingsService, userService)
  const hearingReasonForReferralEditRoute = new HearingReasonForReferralEditRoutes(hearingsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingReasonForReferral.matchers.start, hearingReasonForReferralRoute.view)
  post(adjudicationUrls.hearingReasonForReferral.matchers.start, hearingReasonForReferralRoute.submit)
  get(adjudicationUrls.hearingReasonForReferral.matchers.edit, hearingReasonForReferralEditRoute.view)
  post(adjudicationUrls.hearingReasonForReferral.matchers.edit, hearingReasonForReferralEditRoute.submit)

  return router
}