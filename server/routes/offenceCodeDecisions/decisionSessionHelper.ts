import { Request } from 'express'
import { DecisionAnswers } from './decisionAnswers'

// Methods to deal with adding and removing to and from the session
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
  setSessionAnswers(req, null, draftAdjudicationNumber)
  return decisionAnswers
}
