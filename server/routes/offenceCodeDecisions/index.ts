import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OffenceCodeDecisionsRoutes from './offenceCodeDecisions'

export default function offenceCodeDecisionsRoutes(): Router {
  const router = express.Router()

  const offenceCodeDecisions = new OffenceCodeDecisionsRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:adjudicationNumber/:incidentRole/*', offenceCodeDecisions.view)
  post('/:adjudicationNumber/:incidentRole/*', offenceCodeDecisions.submit)

  return router
}
