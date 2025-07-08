import express, { RequestHandler, Router } from 'express'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import Dis12Pdf from './dis12Pdf'
import Dis3Pdf from './dis3Pdf'
import Dis4Pdf from './dis4Pdf'
import Dis5Pdf from './dis5Pdf'
import Dis6Pdf from './dis6Pdf'
import Dis7Pdf from './dis7Pdf'
import Dis7BlankPdf from './dis7BlankPdf'
import DecisionTreeService from '../../services/decisionTreeService'
import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerSearchService from '../../services/prisonerSearchService'

export default function disPdfRoutes({
  reportedAdjudicationsService,
  decisionTreeService,
  prisonerSearchService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  decisionTreeService: DecisionTreeService
  prisonerSearchService: PrisonerSearchService
}): Router {
  const router = express.Router()

  const dis12Pdf = new Dis12Pdf(reportedAdjudicationsService, decisionTreeService)
  const dis3Pdf = new Dis3Pdf(reportedAdjudicationsService, decisionTreeService)
  const dis4Pdf = new Dis4Pdf(reportedAdjudicationsService)
  const dis5Pdf = new Dis5Pdf(reportedAdjudicationsService, prisonerSearchService)
  const dis6Pdf = new Dis6Pdf(reportedAdjudicationsService)
  const dis7Pdf = new Dis7Pdf(reportedAdjudicationsService)
  const dis7BlankPdf = new Dis7BlankPdf(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)

  get(adjudicationUrls.printPdf.matchers.dis12, dis12Pdf.renderPdf)
  get(adjudicationUrls.printPdf.matchers.dis3, dis3Pdf.renderPdf)
  get(adjudicationUrls.printPdf.matchers.dis4, dis4Pdf.renderPdf)
  get(adjudicationUrls.printPdf.matchers.dis5, dis5Pdf.renderPdf)
  get(adjudicationUrls.printPdf.matchers.dis6, dis6Pdf.renderPdf)
  get(adjudicationUrls.printPdf.matchers.dis7, dis7Pdf.renderPdf)
  get(adjudicationUrls.printPdf.matchers.dis7Blank, dis7BlankPdf.renderPdf)

  return router
}
