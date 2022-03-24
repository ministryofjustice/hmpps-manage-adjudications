import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrintReportRoutes from './printReport'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function prisonerConfirmedOnReportRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const printReport = new PrintReportRoutes(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/pdf-print', printReport.renderPdf)

  get('/:adjudicationNumber', printReport.view)

  return router
}
