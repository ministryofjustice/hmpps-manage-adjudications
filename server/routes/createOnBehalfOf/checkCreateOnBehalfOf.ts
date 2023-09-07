import { Request, Response } from 'express'
import CheckCreateOnBehalfOfPage from './checkCreateOnBehalfOfPage'
import DecisionTreeService from '../../services/decisionTreeService'
import PlaceOnReportService from '../../services/placeOnReportService'
import CheckOnBehalfOfSessionService from './checkOnBehalfOfSessionService'

export default class CheckCreateOnBehalfOfRoutes {
  page: CheckCreateOnBehalfOfPage

  constructor(
    decisionTreeService: DecisionTreeService,
    placeOnReportService: PlaceOnReportService,
    checkOnBehalfOfSessionService: CheckOnBehalfOfSessionService
  ) {
    this.page = new CheckCreateOnBehalfOfPage(decisionTreeService, placeOnReportService, checkOnBehalfOfSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
