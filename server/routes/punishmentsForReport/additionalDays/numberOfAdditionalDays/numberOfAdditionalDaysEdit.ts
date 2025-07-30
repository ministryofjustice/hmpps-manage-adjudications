import { Request, Response } from 'express'
import NumberOfAdditionalDaysPage, { PageRequestType } from './numberOfAdditionalDaysPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import ReportedAdjudicationsService from '../../../../services/reportedAdjudicationsService'

export default class NumberOfAdditionalDaysEditRoute {
  page: NumberOfAdditionalDaysPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly reportedAdjudicationsService: ReportedAdjudicationsService,
  ) {
    this.page = new NumberOfAdditionalDaysPage(
      PageRequestType.EDIT,
      userService,
      punishmentsService,
      reportedAdjudicationsService,
    )
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
