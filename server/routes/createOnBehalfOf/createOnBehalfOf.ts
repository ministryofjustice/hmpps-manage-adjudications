import { Request, Response } from 'express'
import DecisionTreeService from '../../services/decisionTreeService'
import CreateOnBehalfOfPage from './createOnBehalfOfPage'
import CheckOnBehalfOfSessionService from './checkOnBehalfOfSessionService'

export default class CreateOnBehalfOfRoutes {
  page: CreateOnBehalfOfPage

  constructor(decisionTreeService: DecisionTreeService, checkOnBehalfOfSessionService: CheckOnBehalfOfSessionService) {
    this.page = new CreateOnBehalfOfPage(decisionTreeService, checkOnBehalfOfSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
