import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ConfirmedOnReportRoutes from './confirmedOnReport'
import ConfirmedOnReportChangeReportRoutes from './confirmedOnReportChangeReport'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function prisonerConfirmedOnReportRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const confirmedOnReportRoute = new ConfirmedOnReportRoutes(reportedAdjudicationsService)
  const confirmedOnReportChangeReportRoutes = new ConfirmedOnReportChangeReportRoutes(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.confirmedOnReport.matchers.start, confirmedOnReportRoute.view)
  get(adjudicationUrls.confirmedOnReport.matchers.reporterView, confirmedOnReportChangeReportRoutes.view)

  return router
}
