import { Request, Response } from 'express'
import PlaceOnReportService from '../../services/placeOnReportService'
import SelectGenderPage, { PageRequestType } from './selectGenderPage'

export default class selectGenderRoute {
  page: SelectGenderPage

  constructor(placeOnReportService: PlaceOnReportService) {
    this.page = new SelectGenderPage(PageRequestType.ORIGINAL, placeOnReportService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
