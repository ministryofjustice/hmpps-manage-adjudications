import { Request } from 'express'
import { DecisionForm } from './decisionForm'
import { DecisionAnswers } from './decisionAnswers'

// Methods to deal with adding and removing to and from the session
export function setSessionForm(req: Request, form: DecisionForm, draftAdjudicationNumber: string) {
  if (!req.session.decisionForms) {
    req.session.decisionForms = {}
  }
  req.session.decisionForms[draftAdjudicationNumber] = form
}

function getSessionForm(req: Request, draftAdjudicationNumber: string): DecisionForm {
  return req.session.decisionForms?.[draftAdjudicationNumber]
}

export function getAndDeleteSessionForm(req: Request, draftAdjudicationNumber: string): DecisionForm {
  const decisionForm = getSessionForm(req, draftAdjudicationNumber)
  setSessionForm(req, null, draftAdjudicationNumber)
  return decisionForm
}

export function setSessionAnswers(req: Request, answers: DecisionAnswers, draftAdjudicationNumber: string) {
  if (!req.session.decisionAnswers) {
    req.session.decisionAnswers = {}
  }
  req.session.decisionAnswers[draftAdjudicationNumber] = answers
}

export function getSessionAnswers(req: Request, draftAdjudicationNumber: string): DecisionAnswers {
  return req.session.decisionAnswers?.[draftAdjudicationNumber]
}

export function getAndDeleteSessionAnswers(req: Request, draftAdjudicationNumber: string): DecisionAnswers {
  const decisionAnswers = getSessionAnswers(req, draftAdjudicationNumber)
  setSessionForm(req, null, draftAdjudicationNumber)
  return decisionAnswers
}
