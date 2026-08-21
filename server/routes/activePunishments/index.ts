import express, { RequestHandler, Router } from 'express'
import {
  PermissionsService,
  PrisonerAdjudicationsPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'

import ActivePunishments from './activePunishments'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'

export default function adjudicationHistoryRoutes({
  reportedAdjudicationsService,
  punishmentsService,
  permissionsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  punishmentsService: PunishmentsService
  permissionsService: PermissionsService
}): Router {
  const router = express.Router()
  const activePunishmentsRoute = new ActivePunishments(reportedAdjudicationsService, punishmentsService)

  const guard = prisonerPermissionsGuard(permissionsService, {
    requestDependentOn: [PrisonerAdjudicationsPermission.read],
  })

  const get = (path: string, handler: RequestHandler) => router.get(path, guard, handler)
  get(adjudicationUrls.adjudicationHistory.matchers.start, activePunishmentsRoute.view)

  return router
}
