import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ConfirmedOnReportRoutes from './confirmedOnReport'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function prisonerConfirmedOnReportRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const confirmedOnReport = new ConfirmedOnReportRoutes(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:adjudicationNumber', confirmedOnReport.view)

  return router
}
