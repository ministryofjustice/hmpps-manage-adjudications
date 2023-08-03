import path from 'path'
import express, { Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import PlaceOnReportService from '../services/placeOnReportService'

export default function prisonerRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  router.get(
    '/:prisonerNumber/image',
    asyncMiddleware(async (req, res, next) => {
      placeOnReportService
        .getPrisonerImage(req.params.prisonerNumber, res.locals.user)
        .then(data => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(() => {
          const placeHolder = path.join(process.cwd(), '/assets/images/image-missing.jpg')
          res.sendFile(placeHolder)
        })
    })
  )

  return router
}
