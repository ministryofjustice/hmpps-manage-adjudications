import express, { RequestHandler, Router } from 'express'

import SelectGenderRoute from './selectGender'
import SelectGenderEditRoute from './selectGenderEdit'

import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function selectGenderRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const selectGenderRoute = new SelectGenderRoute(placeOnReportService)
  const selectGenderEditRoute = new SelectGenderEditRoute(placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.selectGender.matchers.start, selectGenderRoute.view)
  post(adjudicationUrls.selectGender.matchers.start, selectGenderRoute.submit)
  get(adjudicationUrls.selectGender.matchers.edit, selectGenderEditRoute.view)
  post(adjudicationUrls.selectGender.matchers.edit, selectGenderEditRoute.submit)
  return router
}
