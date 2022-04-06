import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ConfirmedOnReportRoutes from './confirmedOnReport'
import ConfirmedOnReportChangeReportRoutes from './confirmedOnReportChangeReport'
import ConfirmedOnReportChangeReviewRoutes from './confirmedOnReportChangeReview'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import { confirmedOnReport } from '../../utils/urlGenerator'

export default function prisonerConfirmedOnReportRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const confirmedOnReportRoute = new ConfirmedOnReportRoutes(reportedAdjudicationsService)
  const confirmedOnReportChangeReportRoutes = new ConfirmedOnReportChangeReportRoutes(reportedAdjudicationsService)
  const confirmedOnReportChangeReviewRoutes = new ConfirmedOnReportChangeReviewRoutes(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(confirmedOnReport.matchers.start, confirmedOnReportRoute.view)
  get(confirmedOnReport.matchers.reporterView, confirmedOnReportChangeReportRoutes.view)
  get(confirmedOnReport.matchers.reviewerView, confirmedOnReportChangeReviewRoutes.view)

  return router
}
