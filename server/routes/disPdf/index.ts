import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import Dis12Pdf from './dis12Pdf'
import Dis5Pdf from './dis5Pdf'
import Dis6Pdf from './dis6Pdf'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function disPdfRoutes({
  reportedAdjudicationsService,
  decisionTreeService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const dis12Pdf = new Dis12Pdf(reportedAdjudicationsService, decisionTreeService)
  const dis5Pdf = new Dis5Pdf(reportedAdjudicationsService)
  const dis6Pdf = new Dis6Pdf(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get(adjudicationUrls.printPdf.matchers.dis12, dis12Pdf.renderPdf)
  get(adjudicationUrls.printPdf.matchers.dis5, dis5Pdf.renderPdf)
  get(adjudicationUrls.printPdf.matchers.dis6, dis6Pdf.renderPdf)

  return router
}
