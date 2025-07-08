import express, { RequestHandler, Router } from 'express'

import DamagesAmountRoute from './damagesAmount'
import DamagesAmountEditRoute from './damagesAmountEdit'

import UserService from '../../../../services/userService'
import adjudicationUrls from '../../../../utils/urlGenerator'
import PunishmentsService from '../../../../services/punishmentsService'

export default function DamagesAmountRoutes({
  userService,
  punishmentsService,
}: {
  userService: UserService
  punishmentsService: PunishmentsService
}): Router {
  const router = express.Router()

  const damagesAmountRoute = new DamagesAmountRoute(punishmentsService, userService)
  const damagesAmountEditRoute = new DamagesAmountEditRoute(punishmentsService, userService)

  const get = (path: string, handler: RequestHandler) => router.get(path, handler)
  const post = (path: string, handler: RequestHandler) => router.post(path, handler)

  get(adjudicationUrls.damagesAmount.matchers.start, damagesAmountRoute.view)
  post(adjudicationUrls.damagesAmount.matchers.start, damagesAmountRoute.submit)
  get(adjudicationUrls.damagesAmount.matchers.edit, damagesAmountEditRoute.view)
  post(adjudicationUrls.damagesAmount.matchers.edit, damagesAmountEditRoute.submit)

  return router
}
