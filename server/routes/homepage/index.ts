import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import HomepageRoutes from './homepage'

export default function prisonerSearchRoutes(): Router {
  const router = express.Router()

  const prisonerSearch = new HomepageRoutes()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  get('/', prisonerSearch.view)
  return router
}
