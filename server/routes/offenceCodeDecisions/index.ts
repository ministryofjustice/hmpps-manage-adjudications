import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OffenceCodeDecisionsRoutes from './offenceCodeDecisions'
import committed from '../../offenceCodeDecisions/Decisions'

export default function offenceCodeDecisionsRoutes(): Router {
  const router = express.Router()

  const offenceCodeDecisions = new OffenceCodeDecisionsRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/:incidentRole/:offenceCodeDecision', offenceCodeDecisions.view)

  committed.allUrls().forEach(url => {
    get(`/:adjudicationNumber/${url}`, offenceCodeDecisions.view)
  })

  return router
}
