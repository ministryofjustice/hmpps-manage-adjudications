import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../middleware/asyncMiddleware'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import CautionRoutes from './caution'
import CautionEditRoutes from './cautionEdit'
import HearingsService from '../../../services/hearingsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

export default function cautionRoutes({
  reportedAdjudicationsService,
  hearingsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  hearingsService: HearingsService
  userService: UserService
}): Router {
  const router = express.Router()

  const cautionRoute = new CautionRoutes(reportedAdjudicationsService, hearingsService, userService)
  const cautionEditRoute = new CautionEditRoutes(reportedAdjudicationsService, hearingsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.isThisACaution.matchers.start, cautionRoute.view)
  post(adjudicationUrls.isThisACaution.matchers.start, cautionRoute.submit)
  get(adjudicationUrls.isThisACaution.matchers.edit, cautionEditRoute.view)
  post(adjudicationUrls.isThisACaution.matchers.edit, cautionEditRoute.submit)

  return router
}
