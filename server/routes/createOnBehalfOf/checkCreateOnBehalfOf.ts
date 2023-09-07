import { Request, Response } from 'express'
import CheckCreateOnBehalfOfPage from './checkCreateOnBehalfOfPage'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'

export default class CheckCreateOnBehalfOfRoutes {
  page: CheckCreateOnBehalfOfPage

  constructor(decisionTreeService: DecisionTreeService, placeOnReportService: PlaceOnReportService) {
    this.page = new CheckCreateOnBehalfOfPage(decisionTreeService, placeOnReportService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
