import { Request, Response } from 'express'
import ManualEntryConsecutivePunishmentPage, { PageRequestType } from './manualEntryConsecutivePunishmentPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'

export default class numberOfAdditionalDaysRoute {
  page: ManualEntryConsecutivePunishmentPage

  constructor(private readonly userService: UserService, private readonly punishmentsService: PunishmentsService) {
    this.page = new ManualEntryConsecutivePunishmentPage(PageRequestType.EDIT, userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
