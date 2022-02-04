import { Request, Response } from 'express'
import url from 'url'
import decisionTrees from '../../offenceCodeDecisions/DecisionTrees'
import { FormError } from '../../@types/template'
import validateForm from './offenceCodeDecisionsValidation'

import type IncidentRole from '../../offenceCodeDecisions/IncidentRoles'

type PageData = {
  error?: FormError
  selectedDecisionId?: string
}

export default class OffenceCodeRoutes {
  private renderView = async (req: Request, res: Response, pageData?: PageData): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { error, selectedDecisionId } = pageData

    const path = req.path.replace(`/${adjudicationNumber}/${incidentRole}/`, '')
    const decision = decisionTrees.get(incidentRole as IncidentRole).findByUrl(path)

    const pageTitle = decision.getTitle().title // TODO process the title
    const questions = decision.getChildren().map(d => {
      return {
        id: d.id(),
        label: d.getQuestion().question, // TODO process the question
      }
    })

    return res.render(`pages/${decision.getPage() || 'offenceCodeDecisions'}`, {
      errors: error ? [error] : [],
      selectedDecisionId,
      questions,
      pageTitle,
      pageData,
    })
  }

  view = async (req: Request, res: Response): Promise<void> => this.renderView(req, res, {})

  submit = async (req: Request, res: Response): Promise<void> => {
    const { adjudicationNumber, incidentRole } = req.params
    const { selectedDecisionId } = req.body

    const error = validateForm({ selectedDecisionId })

    if (error) {
      return this.renderView(req, res, {
        error,
        selectedDecisionId,
      })
    }

    const selectedDecision = decisionTrees.get(incidentRole as IncidentRole).findById(selectedDecisionId)

    return res.redirect(
      url.format({
        pathname: `/offence-code/${adjudicationNumber}/${incidentRole}/${selectedDecision.getUrl()}`,
      })
    )
  }
}
