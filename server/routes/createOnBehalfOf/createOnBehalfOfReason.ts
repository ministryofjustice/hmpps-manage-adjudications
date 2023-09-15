import { Request, Response } from 'express'
import CreateOnBehalfOfReasonPage from './createOnBehalfOfReasonPage'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CreateOnBehalfOfReasonRoutes {
  page: CreateOnBehalfOfReasonPage

  constructor(createOnBehalfOfSessionService: CreateOnBehalfOfSessionService) {
    this.page = new CreateOnBehalfOfReasonPage(createOnBehalfOfSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
