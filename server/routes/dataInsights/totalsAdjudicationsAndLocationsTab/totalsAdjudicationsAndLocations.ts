import { Request, Response } from 'express'
import TotalsAdjudicationsAndLocationsTabPage from './totalsAdjudicationsAndLocationsTabPage'
import ChartApiService from '../../../services/chartApiService'

export default class TotalsAdjudicationsAndLocationsRoutes {
  page: TotalsAdjudicationsAndLocationsTabPage

  constructor(private readonly chartApiService: ChartApiService) {
    this.page = new TotalsAdjudicationsAndLocationsTabPage(chartApiService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
