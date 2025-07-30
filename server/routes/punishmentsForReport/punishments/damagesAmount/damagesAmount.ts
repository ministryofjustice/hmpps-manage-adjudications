import { Request, Response } from 'express'
import DamagesAmountPage, { PageRequestType } from './damagesAmountPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class DamagesAmountRoute {
  page: DamagesAmountPage

  constructor(
    private readonly punishmentsService: PunishmentsService,
    private readonly userService: UserService,
  ) {
    this.page = new DamagesAmountPage(PageRequestType.CREATION, punishmentsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
