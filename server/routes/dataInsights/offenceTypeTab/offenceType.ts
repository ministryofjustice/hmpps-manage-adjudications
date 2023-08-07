import { Request, Response } from 'express'
import ChartApiService from '../../../services/chartApiService'
import OffenceTypeTabPage from './offenceTypeTabPage'

export default class OffenceTypeRoutes {
  page: OffenceTypeTabPage

  constructor(private readonly chartApiService: ChartApiService) {
    this.page = new OffenceTypeTabPage(chartApiService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
