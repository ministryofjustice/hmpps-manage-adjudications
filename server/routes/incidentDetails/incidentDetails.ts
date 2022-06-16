import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import IncidentDetailsPage, { PageRequestType } from './incidentDetailsPage'
import IncidentDetailsPageBasic from './incidentDetailsPageBasic'
import config from '../../config'

export default class IncidentDetailsRoutes {
  page: IncidentDetailsPage | IncidentDetailsPageBasic

  constructor(placeOnReportService: PlaceOnReportService, locationService: LocationService) {
    this.page =
      config.yoiNewPagesFeatureFlag === true
        ? new IncidentDetailsPageBasic(PageRequestType.CREATION, placeOnReportService, locationService)
        : new IncidentDetailsPage(PageRequestType.CREATION, placeOnReportService, locationService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
