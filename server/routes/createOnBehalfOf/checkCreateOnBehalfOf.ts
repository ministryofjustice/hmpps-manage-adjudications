import { Request, Response } from 'express'
import CheckCreateOnBehalfOfPage from './checkCreateOnBehalfOfPage'
import PlaceOnReportService from '../../services/placeOnReportService'
import CreateOnBehalfOfSessionService from './createOnBehalfOfSessionService'

export default class CheckCreateOnBehalfOfRoutes {
  page: CheckCreateOnBehalfOfPage

  constructor(
    placeOnReportService: PlaceOnReportService,
    createOnBehalfOfSessionService: CreateOnBehalfOfSessionService,
  ) {
    this.page = new CheckCreateOnBehalfOfPage(placeOnReportService, createOnBehalfOfSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
