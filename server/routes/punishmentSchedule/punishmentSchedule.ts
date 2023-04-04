import { Request, Response } from 'express'
import PunishmentSchedulePage, { PageRequestType } from './punishmentSchedulePage'
import UserService from '../../services/userService'

export default class PunishmentScheduleRoute {
  page: PunishmentSchedulePage

  constructor(private readonly userService: UserService) {
    this.page = new PunishmentSchedulePage(PageRequestType.CREATION, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
