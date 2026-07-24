import path from 'path'
import express, { Response, Router } from 'express'
import {
  PermissionsService,
  PrisonerAdjudicationsPermission,
  isGranted,
} from '@ministryofjustice/hmpps-prison-permissions-lib'

import PlaceOnReportService from '../services/placeOnReportService'

export default function prisonerRoutes({
  placeOnReportService,
  permissionsService,
}: {
  placeOnReportService: PlaceOnReportService
  permissionsService: PermissionsService
}): Router {
  const router = express.Router()

  const sendPlaceholder = (res: Response) => {
    const placeHolder = path.join(process.cwd(), '/assets/images/image-missing.jpg')
    res.sendFile(placeHolder)
  }

  router.get('/:prisonerNumber/image', async (req, res) => {
    const { prisonerNumber } = req.params
    try {
      // This is not an HTML page so it must not 403 - fall back to the placeholder the .catch()
      // below already serves when the user may not see this prisoner's adjudication data.
      const prisoner = await permissionsService.getPrisonerDetails(prisonerNumber)
      const permissions = permissionsService.getPrisonerPermissions({
        user: res.locals.user,
        prisoner,
        requestDependentOn: [PrisonerAdjudicationsPermission.read],
      })
      if (!isGranted(PrisonerAdjudicationsPermission.read, permissions)) {
        return sendPlaceholder(res)
      }

      const data = await placeOnReportService.getPrisonerImage(prisonerNumber, res.locals.user)
      res.type('image/jpeg')
      return data.pipe(res)
    } catch {
      return sendPlaceholder(res)
    }
  })

  return router
}
