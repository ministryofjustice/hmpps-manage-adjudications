import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import PrisonerSearchRoutes from './prisonerSearch'

export default function prisonerSearchRoutes(): Router {
  const router = express.Router()

  const prisonerSearch = new PrisonerSearchRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', prisonerSearch.view)
  post('/', prisonerSearch.submit)

  return router
}
