import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'

import CheckYourAnswersCompleteRehabilitativeActivityPage from './checkYourAnswers'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function checkYourAnswersRehabCompleteRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const checkYourAnswersRoute = new CheckYourAnswersCompleteRehabilitativeActivityPage(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.checkYourAnswersCompleteRehabilitativeActivity.matchers.start, checkYourAnswersRoute.view)
  post(adjudicationUrls.checkYourAnswersCompleteRehabilitativeActivity.matchers.start, checkYourAnswersRoute.submit)

  return router
}
