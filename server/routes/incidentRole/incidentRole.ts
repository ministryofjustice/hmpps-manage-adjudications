import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import IncidentRolePage, { PageRequestType } from './incidentRolePage'

export default class IncidentRoleRoutes {
  page: IncidentRolePage

  constructor(placeOnReportService: PlaceOnReportService) {
    this.page = new IncidentRolePage(PageRequestType.EDIT, placeOnReportService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
