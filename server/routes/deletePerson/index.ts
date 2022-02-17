import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import PlaceOnReportService from '../../services/placeOnReportService'
import UserService from '../../services/userService'

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

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', deletePersonRoutes.view)
  post('/', deletePersonRoutes.submit)

  return router
}
