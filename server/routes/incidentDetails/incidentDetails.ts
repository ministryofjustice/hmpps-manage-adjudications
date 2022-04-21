import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import LocationService from '../../services/locationService'
import IncidentDetailsPage, { PageRequestType } from './incidentDetailsPage'

export default class IncidentDetailsRoutes /* extends AdjudicationRoute */ {
  page: IncidentDetailsPage
  journeyPage: IncidentDetailsCreate

  constructor(placeOnReportService: PlaceOnReportService, locationService: LocationService) {
    this.journeyPage = new IncidentDetailsCreate()
    this.page = new IncidentDetailsPage(PageRequestType.CREATION, this.journeyPage, placeOnReportService, locationService)
  }

  matcher = (): string => {
    return this.journeyPage.url.matchers.start
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
