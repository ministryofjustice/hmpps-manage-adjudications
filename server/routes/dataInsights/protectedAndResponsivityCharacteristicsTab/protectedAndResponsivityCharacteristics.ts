import { Request, Response } from 'express'
import ChartApiService from '../../../services/chartApiService'
import ProtectedAndResponsivityCharacteristicsTabPage from './protectedAndResponsivityCharacteristicsTabPage'
import { checkDataInsightsPermissions } from '../dataInsightsTabsOptions'

export default class ProtectedAndResponsivityCharacteristicsRoutes {
  page: ProtectedAndResponsivityCharacteristicsTabPage

  constructor(private readonly chartApiService: ChartApiService) {
    this.page = new ProtectedAndResponsivityCharacteristicsTabPage(chartApiService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await checkDataInsightsPermissions(req, res, this.page.view)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
