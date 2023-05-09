import { Request, Response } from 'express'
import UserService from '../../services/userService'
import PunishmentsService from '../../services/punishmentsService'
import SuspendedPunishmentSchedulePage from './suspendedPunishmentSchedulePage'

export default class SuspendedPunishmentScheduleRoutes {
  page: SuspendedPunishmentSchedulePage

  constructor(punishmentsService: PunishmentsService, userService: UserService) {
    this.page = new SuspendedPunishmentSchedulePage(punishmentsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
