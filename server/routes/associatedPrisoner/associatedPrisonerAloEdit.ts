import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import PrisonerSearchService from '../../services/prisonerSearchService'
import AssociatedPrisonerPage, { PageRequestType } from './associatedPrisonerPage'

export default class AssociatedPrisonerAloEditRoutes {
  page: AssociatedPrisonerPage

  constructor(placeOnReportService: PlaceOnReportService, prisonerSearchService: PrisonerSearchService) {
    this.page = new AssociatedPrisonerPage(PageRequestType.ALO_EDIT, placeOnReportService, prisonerSearchService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
