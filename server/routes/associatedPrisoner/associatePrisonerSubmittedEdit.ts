import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerSearchService from '../../services/prisonerSearchService'
import AssociatePrisonerPage, { PageRequestType } from './associatePrisonerPage'

export default class AssociatePrisonerSubmittedEditRoutes {
  page: AssociatePrisonerPage

  constructor(placeOnReportService: PlaceOnReportService, prisonerSearchService: PrisonerSearchService) {
    this.page = new AssociatePrisonerPage(PageRequestType.EDIT_SUBMITTED, placeOnReportService, prisonerSearchService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
