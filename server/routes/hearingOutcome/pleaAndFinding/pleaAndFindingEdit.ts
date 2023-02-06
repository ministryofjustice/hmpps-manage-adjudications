import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import PleaAndFindingPage, { PageRequestType } from './pleaAndFindingPage'

export default class PleaAndFindingRoutes {
  page: PleaAndFindingPage

  constructor(userService: UserService, hearingsService: HearingsService) {
    this.page = new PleaAndFindingPage(PageRequestType.EDIT, userService, hearingsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
