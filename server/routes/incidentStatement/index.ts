import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import IncidentStatementRoutes from './incidentStatement'

export default function prisonerIncidentStatementsRoutes(): Router {
  const router = express.Router()

  const incidentStatement = new IncidentStatementRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', incidentStatement.view)
  post('/', incidentStatement.submit)

  return router
}
