import { Request, Response } from 'express'
import TotalsAdjudicationsAndLocationsTabPage from './totalsAdjudicationsAndLocationsTabPage'
import ChartService from '../../../services/chartService'

export default class TotalsAdjudicationsAndLocationsRoutes {
  page: TotalsAdjudicationsAndLocationsTabPage

  constructor(private readonly chartService: ChartService) {
    this.page = new TotalsAdjudicationsAndLocationsTabPage(chartService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
