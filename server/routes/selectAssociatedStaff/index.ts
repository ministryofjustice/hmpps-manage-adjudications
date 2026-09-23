import express, { RequestHandler, Router } from 'express'

import SelectAssociatedStaffRoutes from './selectAssociatedStaff'

import UserService from '../../services/userService'
import PlaceOnReportService from '../../services/placeOnReportService'
import adjudicationUrls from '../../utils/urlGenerator'

export default function selectAssociatedStaffRoutes({
  userService,
}: {
  userService: UserService
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const selectAssociatedStaffRoute = new SelectAssociatedStaffRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.selectAssociatedStaff.matchers.start, selectAssociatedStaffRoute.view)
  post(adjudicationUrls.selectAssociatedStaff.matchers.start, selectAssociatedStaffRoute.submit)

  return router
}
