import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import IncidentAssistPage, { PageRequestType } from './incidentAssistPage'

export default class IncidentAssistSubmittedEditRoutes {
  page: IncidentAssistPage

  constructor(placeOnReportService: PlaceOnReportService) {
    this.page = new IncidentAssistPage(PageRequestType.EDIT_SUBMITTED, placeOnReportService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
