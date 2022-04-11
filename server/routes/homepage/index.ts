import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'

import HomepageRoutes from './homepage'
import UserService from '../../services/userService'
import { homepage } from '../../utils/urlGenerator'

export default function homepageRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const prisonerSearch = new HomepageRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  get('/', async (req, res) => res.redirect(homepage.root))
  get(homepage.root, prisonerSearch.view)
  return router
}
