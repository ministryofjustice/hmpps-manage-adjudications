import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import AgeOfPrisonerPage, { PageRequestType } from './ageOfPrisonerPage'

export default class AgeOfPrisonerEditSubmittedRoutes {
  page: AgeOfPrisonerPage

  constructor(placeOnReportService: PlaceOnReportService) {
    this.page = new AgeOfPrisonerPage(PageRequestType.EDIT_SUBMITTED, placeOnReportService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
