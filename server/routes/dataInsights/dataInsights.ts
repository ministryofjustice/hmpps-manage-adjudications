import { Request, Response } from 'express'
import DataInsightsPage from './dataInsightsPage'

export default class DataInsightsRoutes {
  page: DataInsightsPage

  constructor() {
    this.page = new DataInsightsPage()
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
