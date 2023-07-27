import { Request, Response } from 'express'
import ChartApiService from '../../../services/chartApiService'
import OffenceTypeTabPage from './offenceTypeTabPage'
import { checkDataInsightsPermissions } from '../dataInsightsTabsOptions'

export default class OffenceTypeRoutes {
  page: OffenceTypeTabPage

  constructor(private readonly chartApiService: ChartApiService) {
    this.page = new OffenceTypeTabPage(chartApiService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await checkDataInsightsPermissions(req, res, this.page.view)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
