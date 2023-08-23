/* eslint-disable max-classes-per-file */
import { Request, Response } from 'express'
import PunishmentsService from '../../../services/punishmentsService'
import ReasonForChangePage, { PageRequestType } from './reasonForChangePage'
import UserService from '../../../services/userService'

export default class ReasonForChangePunishmentEditRoutes {
  page: ReasonForChangePage

  constructor(private readonly punishmentsService: PunishmentsService, private readonly userService: UserService) {
    this.page = new ReasonForChangePage(PageRequestType.EDIT, punishmentsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
