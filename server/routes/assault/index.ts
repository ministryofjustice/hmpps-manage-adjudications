import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AssaultRoutes from './assault'

export default function prisonerAssaultRoutes(): Router {
  const router = express.Router()

  const assault = new AssaultRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/:prisonerNumber/:id', assault.view)
  post('/:prisonerNumber/:id', assault.submit)

  return router
}
