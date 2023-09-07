import { Request, Response } from 'express'
import DecisionTreeService from '../../services/decisionTreeService'
import CreateOnBehalfOfPage from './createOnBehalfOfPage'

export default class CreateOnBehalfOfRoutes {
  page: CreateOnBehalfOfPage

  constructor(decisionTreeService: DecisionTreeService) {
    this.page = new CreateOnBehalfOfPage(decisionTreeService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
