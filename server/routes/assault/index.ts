import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AssaultRoutes from './assault'
import PlaceOnReportService from '../../services/placeOnReportService'

export default function prisonerAssaultRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const assault = new AssaultRoutes(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:id', assault.view)
  post('/:prisonerNumber/:id', assault.submit)

  return router
}
