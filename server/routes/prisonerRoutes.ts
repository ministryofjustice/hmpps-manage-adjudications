import path from 'path'
import express, { Response, Router } from 'express'

import PlaceOnReportService from '../services/placeOnReportService'
import { prisonerIsInUsersCaseloads } from '../utils/caseloadHelper'

export default function prisonerRoutes({
  placeOnReportService,
}: {
  placeOnReportService: PlaceOnReportService
}): Router {
  const router = express.Router()

  const sendPlaceholder = (res: Response) => res.sendFile(path.join(process.cwd(), '/assets/images/image-missing.jpg'))

  router.get('/:prisonerNumber/image', async (req, res, next) => {
    const { prisonerNumber } = req.params
    const { user } = res.locals

    try {
      const prisoner = await placeOnReportService.getPrisonerDetails(prisonerNumber, user)
      if (!prisonerIsInUsersCaseloads(prisoner.agencyId, user)) {
        return sendPlaceholder(res)
      }
    } catch {
      return sendPlaceholder(res)
    }

    return placeOnReportService
      .getPrisonerImage(prisonerNumber, user)
      .then(data => {
        res.type('image/jpeg')
        data.pipe(res)
      })
      .catch(() => {
        sendPlaceholder(res)
      })
  })

  return router
}
