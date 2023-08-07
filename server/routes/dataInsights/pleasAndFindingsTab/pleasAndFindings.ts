import { Request, Response } from 'express'
import ChartApiService from '../../../services/chartApiService'
import PleasAndFindingsTabPage from './pleasAndFindingsTabPage'

export default class PleasAndFindingsRoutes {
  page: PleasAndFindingsTabPage

  constructor(private readonly chartApiService: ChartApiService) {
    this.page = new PleasAndFindingsTabPage(chartApiService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
