import express, { RequestHandler, Router } from 'express'

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

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.addIssueDateTime.matchers.start, addDateAndTimeOfIssueRoute.view)
  post(adjudicationUrls.addIssueDateTime.matchers.start, addDateAndTimeOfIssueRoute.submit)

  return router
}
