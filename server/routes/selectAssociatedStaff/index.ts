import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import SelectAssociatedStaffRoutes from './selectAssociatedStaff'

import UserService from '../../services/userService'
import PlaceOnReportService from '../../services/placeOnReportService'
import { selectAssociatedStaff } from '../../utils/urlGenerator'

export default function selectAssociatedStaffRoutes({
  userService,
  placeOnReportService,
}: {
  userService: UserService
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const selectAssociatedStaffRoute = new SelectAssociatedStaffRoutes(userService, placeOnReportService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(selectAssociatedStaff.matchers.start, selectAssociatedStaffRoute.view)
  post(selectAssociatedStaff.matchers.start, selectAssociatedStaffRoute.submit)

  return router
}
