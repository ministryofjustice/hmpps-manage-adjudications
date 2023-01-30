import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import HearingReferralConfirmationRoutes from './hearingReferralConfirmation'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'

export default function hearingReferralConfirmationRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const hearingReferralConfirmationRoute = new HearingReferralConfirmationRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingReferralConfirmation.matchers.start, hearingReferralConfirmationRoute.view)

  return router
}
