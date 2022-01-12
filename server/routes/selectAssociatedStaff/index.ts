import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import SelectAssociatedStaffRoutes from './selectAssociatedStaff'

import UserService from '../../services/userService'

export default function selectAssociatedStaffRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const selectAssociatedStaff = new SelectAssociatedStaffRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get('/', selectAssociatedStaff.view)
  post('/', selectAssociatedStaff.submit)

  return router
}
