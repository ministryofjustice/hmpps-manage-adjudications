import { Request, Response } from 'express'
import committed from '../../offenceCodeDecisions/Decisions'

export default class offenceCodeRoutes {
  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole, offenceCodeDecision } = req.params
    const path = req.path.replace(`/${adjudicationNumber}/`, '')
    const decision = committed.findById(offenceCodeDecision) || committed.findByUrl(path)

    const data = {
      children: decision.getChildren(),
      pageTitle: decision.getTitle().title,
    }

    return res.render(`pages/offenceCodeDecisions`, data)
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
