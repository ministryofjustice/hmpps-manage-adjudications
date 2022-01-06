import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import DetailsOfOffenceRoutes from './detailsOfOffence'

export default function detailsOfOffenceRoutes(): Router {
  const router = express.Router()

  const detailsOfOffence = new DetailsOfOffenceRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:id', detailsOfOffence.view)

  return router
}
