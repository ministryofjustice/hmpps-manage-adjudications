import { Request, Response } from 'express'
import committed from '../../offenceCodeDecisions/Decisions'

export default class OffenceCodeRoutes {
  private renderView = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole, offenceCodeDecision } = req.params
    const path = req.path.replace(`/${adjudicationNumber}/`, '')
    const decision = committed.findById(offenceCodeDecision) || committed.findByUrl(path)
    const pageTitle = decision.getTitle().title // TODO process the title
    const questions = decision.getChildren().map(d => {
      return {
        id: d.id(),
        label: d.getQuestion().question, // TODO process the question
      }
    })

    const data = {
      questions,
      pageTitle,
    }

    if (decision.getPage() != null) {
      return res.render(`page${decision.getPage()}, data`)
    }

    return res.render(`pages/offenceCodeDecisions`, data)
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)
}
