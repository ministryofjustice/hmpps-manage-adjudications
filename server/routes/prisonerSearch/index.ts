import express, { RequestHandler, Router } from 'express'

import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerSearchRoutes from './prisonerSearch'
import UserService from '../../services/userService'

export default function prisonerSearchRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const prisonerSearch = new PrisonerSearchRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.searchForPrisoner.matchers.start, prisonerSearch.view)
  post(adjudicationUrls.searchForPrisoner.matchers.start, prisonerSearch.submit)

  return router
}
