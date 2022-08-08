import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import AssociatePrisonerPage, { PageRequestType } from './associatePrisonerPage'

export default class AssociatePrisonerSubmittedEditRoutes {
  page: AssociatePrisonerPage

  constructor(placeOnReportService: PlaceOnReportService) {
    this.page = new AssociatePrisonerPage(PageRequestType.EDIT_SUBMITTED, placeOnReportService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
