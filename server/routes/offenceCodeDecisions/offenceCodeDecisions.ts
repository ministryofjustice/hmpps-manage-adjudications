import { Request, Response } from 'express'
import url from 'url'
import committed from '../../offenceCodeDecisions/Decisions'
import { FormError } from '../../@types/template'

type PageData = {
  error?: FormError
  selectedRadio: string
}

export default class OffenceCodeRoutes {
  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const path = req.path.replace(`/${adjudicationNumber}/${incidentRole}/`, '')
    const decision = committed.findByUrl(path)
    const pageTitle = decision.getTitle().title // TODO process the title
    const questions = decision.getChildren().map(d => {
      return {
        id: d.id(),
        label: d.getQuestion().question, // TODO process the question
      }
    })

    if (decision.getPage() != null) {
      return res.render(`page${decision.getPage()}, data`)
    }

    return res.render(`pages/offenceCodeDecisions`, {
      questions,
      pageTitle,
      pageData,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res)

  submit = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { decisionRadio } = req.body

    // TODO error handling
    const error = false

    if (error) {
      return this.renderView(req, res, {
        error,
        selectedRadio: 'TODO',
      })
    }

    const selectedDecision = committed.findById(decisionRadio)

    return res.redirect(
      url.format({
        pathname: `/offence-code/${adjudicationNumber}/${incidentRole}/${selectedDecision.getUrl()}`,
      })
    )
  }
}
