import { Request, Response } from 'express'
import CreateOnBehalfOfPage from './createOnBehalfOfPage'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CreateOnBehalfOfRoutes {
  page: CreateOnBehalfOfPage

  constructor(createOnBehalfOfSessionService: CreateOnBehalfOfSessionService) {
    this.page = new CreateOnBehalfOfPage(createOnBehalfOfSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
