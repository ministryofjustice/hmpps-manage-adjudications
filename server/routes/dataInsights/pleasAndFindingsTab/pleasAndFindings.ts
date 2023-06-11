import { Request, Response } from 'express'
import ChartService from '../../../services/chartService'
import PleasAndFindingsTabPage from './pleasAndFindingsTabPage'

export default class PleasAndFindingsRoutes {
  page: PleasAndFindingsTabPage

  constructor(private readonly chartService: ChartService) {
    this.page = new PleasAndFindingsTabPage(chartService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
