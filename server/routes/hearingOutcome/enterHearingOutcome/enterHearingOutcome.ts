import { Request, Response } from 'express'
import HearingsService from '../../../services/hearingsService'
import UserService from '../../../services/userService'
import EnterHearingOutcomePage, { PageRequestType } from './enterHearingOutcomePage'

export default class EnterHearingOutcomeRoutes {
  page: EnterHearingOutcomePage

  constructor(userService: UserService, hearingsService: HearingsService) {
    this.page = new EnterHearingOutcomePage(PageRequestType.CREATION, userService, hearingsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
