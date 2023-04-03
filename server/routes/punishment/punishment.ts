import { Request, Response } from 'express'
import PunishmentPage, { PageRequestType } from './punishmentPage'
import UserService from '../../services/userService'

export default class PunishmentRoute {
  page: PunishmentPage

  constructor(private readonly userService: UserService) {
    this.page = new PunishmentPage(PageRequestType.CREATION, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
