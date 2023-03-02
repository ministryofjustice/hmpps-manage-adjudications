import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import ReasonForFindingPage, { PageRequestType } from './reasonForFindingPage'

export default class ReasonForFindingRoutes {
  page: ReasonForFindingPage

  constructor(hearingsService: HearingsService, userService: UserService) {
    this.page = new ReasonForFindingPage(PageRequestType.CREATION, hearingsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
