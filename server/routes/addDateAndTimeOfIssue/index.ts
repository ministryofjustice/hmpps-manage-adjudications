import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import AddDateAndTimeOfIssue from './addDateAndTimeOfIssue'

import ReportedAdjudicationsService from '../../services/reportedAdjudicationsService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function addDateAndTimeOfIssueRoutes({
  reportedAdjudicationsService,
}: {
  reportedAdjudicationsService: ReportedAdjudicationsService
}): Router {
  const router = express.Router()

  const addDateAndTimeOfIssueRoute = new AddDateAndTimeOfIssue(reportedAdjudicationsService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.addIssueDateTime.matchers.start, addDateAndTimeOfIssueRoute.view)
  post(adjudicationUrls.addIssueDateTime.matchers.start, addDateAndTimeOfIssueRoute.submit)

  return router
}
