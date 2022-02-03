import { Request, Response } from 'express'
import committed from '../../offenceCodeDecisions/Decisions'

export default class offenceCodesRoutes {
  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { incidentRole, offenceCodeDecision } = req.params
    const currentDecision = committed.findById(offenceCodeDecision)
    return res.render(`pages/offenceCodeDecisions`, {})
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
