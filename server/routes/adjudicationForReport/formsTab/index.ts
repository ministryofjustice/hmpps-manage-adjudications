import express, { RequestHandler, Router } from 'express'

import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import FormsTabRoute from './formsTabView'

export default function FormsRoutes({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const formsTabRoute = new FormsTabRoute(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.forms.matchers.view, formsTabRoute.view)

  return router
}
