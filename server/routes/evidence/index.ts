import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import EvidenceSessionService from '../../services/evidenceSessionService'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import DetailsOfEvidencePage, { PageRequestType } from './detailsOfEvidence'
import AddEvidenceRoutes from './addEvidence'

export default function detailsOfOffenceRoutes({
  placeOnReportService,
  evidenceSessionService,
}: {
  placeOnReportService: PlaceOnReportService
  evidenceSessionService: EvidenceSessionService
}): Router {
  const router = express.Router()

  const detailsOfEvidenceUsingDraft = new DetailsOfEvidencePage(
    PageRequestType.EVIDENCE_FROM_API,
    placeOnReportService,
    evidenceSessionService
  )

  const detailsOfEvidenceUsingSession = new DetailsOfEvidencePage(
    PageRequestType.EVIDENCE_FROM_SESSION,
    placeOnReportService,
    evidenceSessionService
  )

  const addEvidence = new AddEvidenceRoutes(evidenceSessionService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.detailsOfEvidence.matchers.start, detailsOfEvidenceUsingDraft.view)
  post(adjudicationUrls.detailsOfEvidence.matchers.start, detailsOfEvidenceUsingDraft.submit)
  get(adjudicationUrls.detailsOfEvidence.matchers.modified, detailsOfEvidenceUsingSession.view)
  post(adjudicationUrls.detailsOfEvidence.matchers.modified, detailsOfEvidenceUsingSession.submit)
  get(adjudicationUrls.detailsOfEvidence.matchers.add, addEvidence.view)
  post(adjudicationUrls.detailsOfEvidence.matchers.add, addEvidence.submit)

  return router
}
