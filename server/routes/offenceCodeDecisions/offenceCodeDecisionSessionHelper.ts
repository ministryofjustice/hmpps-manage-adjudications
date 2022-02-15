import { Request } from 'express'
import { DecisionForm } from './decisionForm'

// Methods to deal with add, removing a DecisionFrom from the session.
export function setSessionDecisionForm(req: Request, form: DecisionForm, draftAdjudicationNumber: string) {
  if (!req.session.sessionDecisionForms) {
    req.session.sessionDecisionForms = {}
  }
  req.session.sessionDecisionForms[draftAdjudicationNumber] = form
}

function getSessionDecisionForm(req: Request, draftAdjudicationNumber: string): DecisionForm {
  return req.session.sessionDecisionForms?.[draftAdjudicationNumber]
}

export function getAndDeleteSessionDecisionForm(req: Request, draftAdjudicationNumber: string): DecisionForm {
  const sessionDecisionForm = getSessionDecisionForm(req, draftAdjudicationNumber)
  setSessionDecisionForm(req, null, draftAdjudicationNumber)
  return sessionDecisionForm
}
