import express, { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import adjudicationUrls from '../../utils/urlGenerator'
import PrisonerSearchRoutes from './prisonerSearch'
import UserService from '../../services/userService'

export default function prisonerSearchRoutes({ userService }: { userService: UserService }): Router {
  const router = express.Router()

  const prisonerSearch = new PrisonerSearchRoutes(userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  get(adjudicationUrls.searchForPrisoner.matchers.start, prisonerSearch.view)
  post(adjudicationUrls.searchForPrisoner.matchers.start, prisonerSearch.submit)

  return router
}
