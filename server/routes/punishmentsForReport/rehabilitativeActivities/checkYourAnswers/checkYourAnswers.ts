import { Request, Response } from 'express'
import UserService from '../../../../services/userService'
import CheckYourAnswersCompleteRehabilitativeActivityPage from './checkYourAnswersPage'
import PunishmentsService from '../../../../services/punishmentsService'

export default class CheckYourAnswersompleteRehabilitativeActivityRoutes {
  page: CheckYourAnswersCompleteRehabilitativeActivityPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
  ) {
    this.page = new CheckYourAnswersCompleteRehabilitativeActivityPage(userService, punishmentsService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
