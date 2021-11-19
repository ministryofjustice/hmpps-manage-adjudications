import { Request, Response } from 'express'

import PlaceOnReportService from '../../services/placeOnReportService'

export default class DraftTaskListRoutes {
  constructor(private readonly placeOnReportService: PlaceOnReportService) {}

  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber, id } = req.params
    const { user } = res.locals

    const idValue: number = parseInt(id as string, 10)
    if (Number.isNaN(idValue)) {
      throw new Error('No adjudication number provided')
    }

    const prisoner = await this.placeOnReportService.getPrisonerDetails(prisonerNumber, user)

    return res.render(`pages/draftTaskList`, {
      prisoner,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
