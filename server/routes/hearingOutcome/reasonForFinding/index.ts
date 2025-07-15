import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'
import HearingsService from '../../../services/hearingsService'
import ReasonForFindingRoutes from './reasonForFinding'
import ReasonForFindingEditRoutes from './reasonForFindingEdit'

export default function reasonForFindingRoutes({
  reportedAdjudicationsService,
  hearingsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  hearingsService: HearingsService
  userService: UserService
}): Router {
  const router = express.Router()

  const reasonForFindingRoute = new ReasonForFindingRoutes(reportedAdjudicationsService, hearingsService, userService)
  const reasonForFindingEditRoute = new ReasonForFindingEditRoutes(
    reportedAdjudicationsService,
    hearingsService,
    userService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.hearingReasonForFinding.matchers.start, reasonForFindingRoute.view)
  post(adjudicationUrls.hearingReasonForFinding.matchers.start, reasonForFindingRoute.submit)
  get(adjudicationUrls.hearingReasonForFinding.matchers.edit, reasonForFindingEditRoute.view)
  post(adjudicationUrls.hearingReasonForFinding.matchers.edit, reasonForFindingEditRoute.submit)

  return router
}
