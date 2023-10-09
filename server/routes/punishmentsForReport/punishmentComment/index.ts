import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import PunishmentCommentRoute from './punishmentComment'

import UserService from '../../../services/userService'
import adjudicationUrls from '../../../utils/urlGenerator'
import PunishmentsService from '../../../services/punishmentsService'
import PunishmentCommentEditRoute from './punishmentCommentEdit'
import PunishmentCommentDeleteRoute from './punishmentCommentDelete'

export default function PunishmentCommentRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const punishmentCommentRoute = new PunishmentCommentRoute(userService, punishmentsService)
  const punishmentCommentEditRoute = new PunishmentCommentEditRoute(userService, punishmentsService)
  const punishmentCommentDeleteRoute = new PunishmentCommentDeleteRoute(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.punishmentComment.matchers.add, punishmentCommentRoute.view)
  post(adjudicationUrls.punishmentComment.matchers.add, punishmentCommentRoute.submit)
  get(adjudicationUrls.punishmentComment.matchers.edit, punishmentCommentEditRoute.view)
  post(adjudicationUrls.punishmentComment.matchers.edit, punishmentCommentEditRoute.submit)
  get(adjudicationUrls.punishmentComment.matchers.delete, punishmentCommentDeleteRoute.view)
  post(adjudicationUrls.punishmentComment.matchers.delete, punishmentCommentDeleteRoute.submit)

  return router
}
