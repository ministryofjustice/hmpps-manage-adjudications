import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingCheckYourAnswersRoutes from './hearingCheckYourAnswers'
import HearingCheckYourAnswersEditRoutes from './hearingCheckYourAnswersEdit'

export default function hearingCheckYourAnswersRoutes({
  hearingsService,
  userService,
  reportedAdjudicationsService,
}: {
  hearingsService: HearingsService
  userService: UserService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const hearingCheckYourAnswersRoute = new HearingCheckYourAnswersRoutes(
    hearingsService,
    userService,
    reportedAdjudicationsService
  )
  const hearingCheckYourAnswersEditRoute = new HearingCheckYourAnswersEditRoutes(
    hearingsService,
    userService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.hearingsCheckAnswers.matchers.start, hearingCheckYourAnswersRoute.view)
  post(adjudicationUrls.hearingsCheckAnswers.matchers.start, hearingCheckYourAnswersRoute.submit)
  get(adjudicationUrls.hearingsCheckAnswers.matchers.edit, hearingCheckYourAnswersEditRoute.view)
  post(adjudicationUrls.hearingsCheckAnswers.matchers.edit, hearingCheckYourAnswersEditRoute.submit)

  return router
}
