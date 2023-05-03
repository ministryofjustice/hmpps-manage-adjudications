import { Request, Response } from 'express'
import UserService from '../../../services/userService'
import ActivateSuspendedPunishmentsPage from './activateSuspendedPunishmentsPage'
import PunishmentsService from '../../../services/punishmentsService'

export default class ActivateSuspendedPunishmentsRoutes {
  page: ActivateSuspendedPunishmentsPage

  constructor(punishmentsService: PunishmentsService, userService: UserService) {
    this.page = new ActivateSuspendedPunishmentsPage(punishmentsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
