import express, { RequestHandler, Router } from 'express'

import ConfirmedOnReportPage, { PageRequestType } from './confirmedOnReportPage'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function prisonerConfirmedOnReportRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const confirmedOnReportRoute = new ConfirmedOnReportPage(
    PageRequestType.ORIGINAL_REPORT_CONFIRMATION,
    reportedAdjudicationsService
  )
  const confirmedOnReportChangeReportRoutes = new ConfirmedOnReportPage(
    PageRequestType.REPORT_CHANGE,
    reportedAdjudicationsService
  )
  const confirmedOnReportPostReviewChangeRoutes = new ConfirmedOnReportPage(
    PageRequestType.POST_REVIEW_REPORT_CHANGE,
    reportedAdjudicationsService
  )

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.confirmedOnReport.matchers.start, confirmedOnReportRoute.view)
  get(adjudicationUrls.confirmedOnReport.matchers.confirmationOfChange, confirmedOnReportChangeReportRoutes.view)
  get(
    adjudicationUrls.confirmedOnReport.matchers.confirmationOfChangePostReview,
    confirmedOnReportPostReviewChangeRoutes.view
  )

  return router
}
