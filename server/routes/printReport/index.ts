import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrintReportRoutes from './printReport'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import DecisionTreeService from '../../services/decisionTreeService'

export default function prisonerConfirmedOnReportRoutes({
  reportedAdjudicationsService,
  decisionTreeService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const printReport = new PrintReportRoutes(reportedAdjudicationsService, decisionTreeService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/pdf', printReport.renderPdf)

  get('/:adjudicationNumber', printReport.view)

  return router
}
