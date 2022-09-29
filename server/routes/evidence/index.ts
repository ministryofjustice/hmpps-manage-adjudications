import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import EvidenceSessionService from '../../services/evidenceSessionService'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'
import DetailsOfEvidencePage, { PageRequestType } from './detailsOfEvidence'
import AddEvidenceRoutes from './addEvidence'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function detailsOfEvidenceRoutes({
  placeOnReportService,
  evidenceSessionService,
  reportedAdjudicationsService,
}: {
  placeOnReportService: PlaceOnReportService
  evidenceSessionService: EvidenceSessionService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()
  const detailsOfEvidenceUsingDraft = new DetailsOfEvidencePage(
    PageRequestType.EVIDENCE_FROM_API,
    placeOnReportService,
    evidenceSessionService,
    reportedAdjudicationsService
  )

  const detailsOfEvidenceUsingSession = new DetailsOfEvidencePage(
    PageRequestType.EVIDENCE_FROM_SESSION,
    placeOnReportService,
    evidenceSessionService,
    reportedAdjudicationsService
  )

  const submittedEditDetailsOfEvidenceUsingDraft = new DetailsOfEvidencePage(
    PageRequestType.SUBMITTED_EDIT_EVIDENCE_FROM_API,
    placeOnReportService,
    evidenceSessionService,
    reportedAdjudicationsService
  )

  const submittedEditDetailsOfEvidenceUsingSession = new DetailsOfEvidencePage(
    PageRequestType.SUBMITTED_EDIT_EVIDENCE_FROM_SESSION,
    placeOnReportService,
    evidenceSessionService,
    reportedAdjudicationsService
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
  get(adjudicationUrls.detailsOfEvidence.matchers.submittedEdit, submittedEditDetailsOfEvidenceUsingDraft.view)
  post(adjudicationUrls.detailsOfEvidence.matchers.submittedEdit, submittedEditDetailsOfEvidenceUsingDraft.submit)
  get(
    adjudicationUrls.detailsOfEvidence.matchers.submittedEditModified,
    submittedEditDetailsOfEvidenceUsingSession.view
  )
  post(
    adjudicationUrls.detailsOfEvidence.matchers.submittedEditModified,
    submittedEditDetailsOfEvidenceUsingSession.submit
  )

  return router
}
