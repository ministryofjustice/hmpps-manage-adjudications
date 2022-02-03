import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import OffenceCodesRoutes from './offenceCodeDecisions'

export default function offenceCodesRoutes(): Router {
  const router = express.Router()

  const offenceCodes = new OffenceCodesRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:incidentRole/:offenceCodeDecision', offenceCodes.view)

  return router
}
