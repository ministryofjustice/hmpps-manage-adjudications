import { Request, Response } from 'express'
import ChartApiService from '../../../services/chartApiService'
import PunishmentsTabPage from './punishmentsTabPage'
import { checkDataInsightsPermissions } from '../dataInsightsTabsOptions'

export default class PunishmentsRoutes {
  page: PunishmentsTabPage

  constructor(private readonly chartApiService: ChartApiService) {
    this.page = new PunishmentsTabPage(chartApiService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await checkDataInsightsPermissions(req, res, this.page.view)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
