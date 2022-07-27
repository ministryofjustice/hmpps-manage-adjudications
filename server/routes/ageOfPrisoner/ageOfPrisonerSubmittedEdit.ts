import { Request, Response } from 'express'
import AllOffencesSessionService from '../../services/allOffencesSessionService'
import PlaceOnReportService from '../../services/placeOnReportService'
import AgeOfPrisonerPage, { PageRequestType } from './ageOfPrisonerPage'

export default class AgeOfPrisonerEditSubmittedRoutes {
  page: AgeOfPrisonerPage

  constructor(placeOnReportService: PlaceOnReportService, allOffencesSessionService: AllOffencesSessionService) {
    this.page = new AgeOfPrisonerPage(PageRequestType.EDIT_SUBMITTED, placeOnReportService, allOffencesSessionService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
