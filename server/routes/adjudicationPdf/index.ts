import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import AdjudicationPdf from './adjudicationPdf'
import DecisionTreeService from '../../services/decisionTreeService'

export default function adjudicationPdfRoutes({
  reportedAdjudicationsService,
  decisionTreeService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  decisionTreeService: DecisionTreeService
}): Router {
  const router = express.Router()

  const adjudicationPdf = new AdjudicationPdf(reportedAdjudicationsService, decisionTreeService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/pdf', adjudicationPdf.renderPdf)

  return router
}
