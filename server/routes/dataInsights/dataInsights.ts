import { Request, Response } from 'express'
import DataInsightsPage from './dataInsightsPage'
import ChartService from '../../services/chartService'

export default class DataInsightsRoutes {
  page: DataInsightsPage

  constructor(private readonly chartService: ChartService) {
    this.page = new DataInsightsPage(chartService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
