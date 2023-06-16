import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import HomepageRoutes from './homepage'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'
import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'

export default function homepageRoutes({
  userService,
  reportedAdjudicationsService,
}: {
  userService: UserService
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const prisonerSearch = new HomepageRoutes(userService, reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  get('/', async (req, res) => res.redirect(adjudicationUrls.homepage.root))
  get(adjudicationUrls.homepage.root, prisonerSearch.view)
  return router
}
