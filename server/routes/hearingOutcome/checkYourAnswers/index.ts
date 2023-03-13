import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import HearingCheckYourAnswersRoutes from './hearingCheckYourAnswers'

export default function hearingCheckYourAnswersRoutes({
  hearingsService,
  userService,
}: {
  hearingsService: HearingsService
  userService: UserService
}): Router {
  const router = express.Router()

  const hearingCheckYourAnswersRoute = new HearingCheckYourAnswersRoutes(hearingsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.hearingsCheckAnswers.matchers.start, hearingCheckYourAnswersRoute.view)
  post(adjudicationUrls.hearingsCheckAnswers.matchers.start, hearingCheckYourAnswersRoute.submit)

  return router
}
