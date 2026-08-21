import express, { RequestHandler, Router } from 'express'
import {
  PermissionsService,
  PrisonerAdjudicationsPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'

import AdjudicationHistory from './adjudicationHistory'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function adjudicationHistoryRoutes({
  reportedAdjudicationsService,
  permissionsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  permissionsService: PermissionsService
}): Router {
  const router = express.Router()

  const adjudicationHistoryRoute = new AdjudicationHistory(reportedAdjudicationsService)

  const guard = prisonerPermissionsGuard(permissionsService, {
    requestDependentOn: [PrisonerAdjudicationsPermission.read],
  })

  const get = (path: string, handler: RequestHandler) => router.get(path, guard, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, guard, handler)

  get(adjudicationUrls.adjudicationHistory.matchers.start, adjudicationHistoryRoute.view)
  post(adjudicationUrls.adjudicationHistory.matchers.start, adjudicationHistoryRoute.submit)

  return router
}
