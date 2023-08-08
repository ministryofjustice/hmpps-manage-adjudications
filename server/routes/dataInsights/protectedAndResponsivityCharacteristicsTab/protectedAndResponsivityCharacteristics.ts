import { Request, Response } from 'express'
import ChartApiService from '../../../services/chartApiService'
import ProtectedAndResponsivityCharacteristicsTabPage from './protectedAndResponsivityCharacteristicsTabPage'

export default class ProtectedAndResponsivityCharacteristicsRoutes {
  page: ProtectedAndResponsivityCharacteristicsTabPage

  constructor(private readonly chartApiService: ChartApiService) {
    this.page = new ProtectedAndResponsivityCharacteristicsTabPage(chartApiService)
  }

  view = async (req: Request, res: Response): Promise<void> => {
    await this.page.view(req, res)
  }

  submit = async (req: Request, res: Response): Promise<void> => {
    await this.page.submit(req, res)
  }
}
