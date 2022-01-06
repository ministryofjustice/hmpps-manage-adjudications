import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import TypeOfOffenceRoutes from './typeOfOffence'

export default function typeOfOffenceRoutes(): Router {
  const router = express.Router()

  const typeOfOffence = new TypeOfOffenceRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:id', typeOfOffence.view)

  return router
}
