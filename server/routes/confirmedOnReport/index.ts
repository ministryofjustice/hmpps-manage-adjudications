import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ConfirmedOnReportRoutes from './confirmedOnReport'
import ConfirmedOnReportChangeReportRoutes from './confirmedOnReportChangeReport'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function prisonerConfirmedOnReportRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const confirmedOnReport = new ConfirmedOnReportRoutes(reportedAdjudicationsService)
  const confirmedOnReportChangeReportRoutes = new ConfirmedOnReportChangeReportRoutes(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:adjudicationNumber', confirmedOnReport.view)
  get('/:adjudicationNumber/changes-confirmed/report', confirmedOnReportChangeReportRoutes.view)

  return router
}
