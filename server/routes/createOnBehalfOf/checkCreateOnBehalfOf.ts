import { Request, Response } from 'express'
import CheckCreateOnBehalfOfPage from './checkCreateOnBehalfOfPage'
import DecisionTreeService from '../../services/decisionTreeService'

export default class CheckCreateOnBehalfOfRoutes {
  page: CheckCreateOnBehalfOfPage

  constructor(decisionTreeService: DecisionTreeService) {
    this.page = new CheckCreateOnBehalfOfPage(decisionTreeService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
