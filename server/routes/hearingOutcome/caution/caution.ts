import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import CautionPage from './cautionPage'

export default class CautionRoutes {
  page: CautionPage

  constructor(hearingsService: HearingsService, userService: UserService) {
    this.page = new CautionPage(hearingsService, userService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}