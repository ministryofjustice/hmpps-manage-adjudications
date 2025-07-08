import express, { RequestHandler, Router } from 'express'

import PleaAndFindingRoutes from './pleaAndFinding'
import PleaAndFindingEditRoutes from './pleaAndFindingEdit'

import adjudicationUrls from '../../../utils/urlGenerator'
import UserService from '../../../services/userService'
import HearingsService from '../../../services/hearingsService'
import ReportedAdjudicationsService from '../../../services/reportedAdjudicationsService'

export default function pleaAndFindingRoutes({
  userService,
  hearingsService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  hearingsService: HearingsService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const pleaAndFindingRoute = new PleaAndFindingRoutes(userService, hearingsService, reportedAdjudicationsService)
  const pleaAndFindingEditRoute = new PleaAndFindingEditRoutes(
    userService,
    hearingsService,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.hearingPleaAndFinding.matchers.start, pleaAndFindingRoute.view)
  post(adjudicationUrls.hearingPleaAndFinding.matchers.start, pleaAndFindingRoute.submit)
  get(adjudicationUrls.hearingPleaAndFinding.matchers.edit, pleaAndFindingEditRoute.view)
  post(adjudicationUrls.hearingPleaAndFinding.matchers.edit, pleaAndFindingEditRoute.submit)

  return router
}
