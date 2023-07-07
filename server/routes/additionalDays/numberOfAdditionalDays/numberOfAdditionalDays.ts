import { Request, Response } from 'express'
import NumberOfAdditionalDaysPage, { PageRequestType } from './numberOfAdditionalDaysPage'
import UserService from '../../../services/userService'
import PunishmentsService from '../../../services/punishmentsService'

export default class numberOfAdditionalDaysRoute {
  page: NumberOfAdditionalDaysPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new NumberOfAdditionalDaysPage(PageRequestType.CREATION, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
