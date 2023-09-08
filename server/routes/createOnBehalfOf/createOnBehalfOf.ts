import { Request, Response } from 'express'
import DecisionTreeService from '../../services/decisionTreeService'
import CreateOnBehalfOfPage from './createOnBehalfOfPage'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CreateOnBehalfOfRoutes {
  page: CreateOnBehalfOfPage

  constructor(
    decisionTreeService: DecisionTreeService,
    createOnBehalfOfSessionService: CreateOnBehalfOfSessionService
  ) {
    this.page = new CreateOnBehalfOfPage(decisionTreeService, createOnBehalfOfSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
