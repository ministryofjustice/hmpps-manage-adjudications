import { Request, Response } from 'express'
import ChartService from '../../../services/chartService'
import PunishmentsTabPage from './punishmentsTabPage'

export default class PunishmentsRoutes {
  page: PunishmentsTabPage

  constructor(private readonly chartService: ChartService) {
    this.page = new PunishmentsTabPage(chartService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }
}
