import express, { RequestHandler, Router } from 'express'

import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import EditRehabilitativeActivityPage from './editRehabActivity'

export default function EditRehabilitativeActivityRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const editRehabilitativeActivityRoute = new EditRehabilitativeActivityPage(userService, punishmentsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.editRehabilitativeActivity.matchers.start, editRehabilitativeActivityRoute.view)
  post(adjudicationUrls.editRehabilitativeActivity.matchers.start, editRehabilitativeActivityRoute.submit)

  return router
}
