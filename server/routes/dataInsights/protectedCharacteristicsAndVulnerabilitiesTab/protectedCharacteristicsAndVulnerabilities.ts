import { Request, Response } from 'express'
import ChartApiService from '../../../services/chartApiService'
import ProtectedCharacteristicsAndVulnerabilitiesTabPage from './protectedCharacteristicsAndVulnerabilitiesTabPage'

export default class ProtectedCharacteristicsAndVulnerabilitiesRoutes {
  page: ProtectedCharacteristicsAndVulnerabilitiesTabPage

  constructor(private readonly chartApiService: ChartApiService) {
    this.page = new ProtectedCharacteristicsAndVulnerabilitiesTabPage(chartApiService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
