import { Request, Response } from 'express'

export default class OffenceDetailsRoutes {
  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { prisonerNumber, id } = req.params
    return res.render(`pages/offenceDetails`, {
      prisonerNumber,
      id,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
