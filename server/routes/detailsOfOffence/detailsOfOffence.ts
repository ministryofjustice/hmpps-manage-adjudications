import { Request, Response } from 'express'

export default class DetailsOfOffenceRoutes {
  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber, id } = req.params
    return res.render(`pages/detailsOfOffence`, {
      prisonerNumber,
      id,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
