import { Request, Response } from 'express'
import ChartService from '../../../services/chartService'
import ProtectedCharacteristicsAndVulnerabilitiesTabPage from './protectedCharacteristicsAndVulnerabilitiesTabPage'

export default class ProtectedCharacteristicsAndVulnerabilitiesRoutes {
  page: ProtectedCharacteristicsAndVulnerabilitiesTabPage

  constructor(private readonly chartService: ChartService) {
    this.page = new ProtectedCharacteristicsAndVulnerabilitiesTabPage(chartService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
