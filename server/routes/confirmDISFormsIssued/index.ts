import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import ConfirmDISFormsIssued from './confirmDISFormsIssued'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function confirmDISFormsIssuedRoutes({
  reportedAdjudicationsService,
  userService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
  userService: UserService
}): Router {
  const router = express.Router()

  const confirmDISFormsIssuedRoute = new ConfirmDISFormsIssued(reportedAdjudicationsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.confirmDISFormsIssued.matchers.start, confirmDISFormsIssuedRoute.view)
  post(adjudicationUrls.confirmDISFormsIssued.matchers.start, confirmDISFormsIssuedRoute.submit)

  return router
}
