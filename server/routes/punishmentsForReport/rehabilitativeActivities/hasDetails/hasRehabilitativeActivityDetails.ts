import { Request, Response } from 'express'
import HasRehabilitativeActivitiesDetailsPage from './hasRehabilitativeActivityDetailsPage'
import UserService from '../../../../services/userService'
import PunishmentsService from '../../../../services/punishmentsService'
import type RehabBatchSessionService from '../../../../services/rehabBatchSessionService'

export default class HasRehabilitativeActivitiesDetailsRoutes {
  page: HasRehabilitativeActivitiesDetailsPage

  constructor(
    private readonly userService: UserService,
    private readonly punishmentsService: PunishmentsService,
    private readonly rehabBatchSessionService: RehabBatchSessionService,
  ) {
    this.page = new HasRehabilitativeActivitiesDetailsPage(userService, punishmentsService, rehabBatchSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
