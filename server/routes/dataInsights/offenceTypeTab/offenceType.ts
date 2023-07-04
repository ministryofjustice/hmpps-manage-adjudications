import { Request, Response } from 'express'
import ChartService from '../../../services/chartService'
import OffenceTypeTabPage from './offenceTypeTabPage'

export default class OffenceTypeRoutes {
  page: OffenceTypeTabPage

  constructor(private readonly chartService: ChartService) {
    this.page = new OffenceTypeTabPage(chartService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
