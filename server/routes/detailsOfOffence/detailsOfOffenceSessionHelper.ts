import { Request } from 'express'
import { DecisionAnswers } from '../offenceCodeDecisions/decisionAnswers'

// Methods to deal with adding and removing to and from the session
export function addSessionOffence(req: Request, answers: DecisionAnswers, draftAdjudicationNumber: string) {
  if (!req.session.offences) {
    req.session.offences = {}
  }
  if (!req.session.offences[draftAdjudicationNumber]) {
    req.session.offences[draftAdjudicationNumber] = []
  }
  req.session.offences[draftAdjudicationNumber].push(answers)
}

export function deleteSessionOffence(req: Request, index: number, draftAdjudicationNumber: string) {
  req.session.offences[draftAdjudicationNumber]?.splice(index)
}

export function getSessionOffences(req: Request, draftAdjudicationNumber: string): Array<DecisionAnswers> {
  return req.session?.offences[draftAdjudicationNumber]
}
