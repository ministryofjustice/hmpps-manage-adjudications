import express, { RequestHandler, Router } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'
import adjudicationUrls from '../../utils/urlGenerator'

import DeletePersonRoutes from './deletePerson'

export default function deleteAssociatedPersonRoutes({
  placeOnReportService,
  userService,
}: {
  placeOnReportService: PlaceOnReportService
  userService: UserService
}): Router {
  const router = express.Router()

  const deletePersonRoutes = new DeletePersonRoutes(placeOnReportService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.deletePerson.matchers.start, deletePersonRoutes.view)
  post(adjudicationUrls.deletePerson.matchers.start, deletePersonRoutes.submit)

  return router
}
