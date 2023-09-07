import { Request, Response } from 'express'
import DecisionTreeService from '../../services/decisionTreeService'
import CreateOnBehalfOfReasonPage from './createOnBehalfOfReasonPage'
import CheckOnBehalfOfSessionService from './checkOnBehalfOfSessionService'

export default class CreateOnBehalfOfReasonRoutes {
  page: CreateOnBehalfOfReasonPage

  constructor(decisionTreeService: DecisionTreeService, checkOnBehalfOfSessionService: CheckOnBehalfOfSessionService) {
    this.page = new CreateOnBehalfOfReasonPage(decisionTreeService, checkOnBehalfOfSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
