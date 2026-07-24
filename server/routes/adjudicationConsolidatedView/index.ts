import express, { RequestHandler, Router } from 'express'
import {
  PermissionsService,
  PrisonerAdjudicationsPermission,
  prisonerPermissionsGuard,
} from '@ministryofjustice/hmpps-prison-permissions-lib'

import AdjudicationConsolidatedView from './adjudicationConsolidatedView'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import PunishmentsService from '../../services/punishmentsService'

export default function adjudicationConsolidatedViewRoutes({
  reportedAdjudicationsService,
  decisionTreeService,
  punishmentsService,
  permissionsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  decisionTreeService: DecisionTreeService
  punishmentsService: PunishmentsService
  permissionsService: PermissionsService
}): Router {
  const router = express.Router()

  const adjudicationConsolidatedViewRoute = new AdjudicationConsolidatedView(
    reportedAdjudicationsService,
    decisionTreeService,
    punishmentsService,
  )

  const guard = prisonerPermissionsGuard(permissionsService, {
    requestDependentOn: [PrisonerAdjudicationsPermission.read],
  })

  const get = (path: string, handler: RequestHandler) => router.get(path, guard, handler)

  get(adjudicationUrls.prisonerReportConsolidated.matchers.view, adjudicationConsolidatedViewRoute.view)

  return router
}
