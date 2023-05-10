import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import ManuallyActivateSuspendedPunishmentsPage from './manuallyActivateSuspendedPunishmentsPage'
import PunishmentsService from '../../../services/punishmentsService'

export default class ManuallyActivateSuspendedPunishmentsRoutes {
  page: ManuallyActivateSuspendedPunishmentsPage

  constructor(punishmentsService: PunishmentsService, userService: UserService) {
    this.page = new ManuallyActivateSuspendedPunishmentsPage(punishmentsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
