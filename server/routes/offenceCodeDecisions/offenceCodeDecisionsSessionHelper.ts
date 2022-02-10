import { Request, Response } from 'express'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { DecisionType } from '../../offenceCodeDecisions/Decision'
import { DecisionForm } from './decisionForm'

// TODO rename
// Methods to deal with add, removing and parsing a DecisionFrom from the session and requests
export function setSessionDecisionForm(req: Request, form: DecisionForm) {
  req.session.sessionDecisionForm = form
}

function getSessionDecisionForm(req: Request) {
  return req.session.sessionDecisionForm as DecisionForm
}

export function getAndDeleteSessionDecisionForm(req: Request): DecisionForm {
  const sessionDecisionForm = getSessionDecisionForm(req)
  setSessionDecisionForm(req, null)
  return sessionDecisionForm
}

export function updateSessionDecisionForm(res: Request, redirectData: string) {
  const form = getSessionDecisionForm(res)
  if (form) {
    switch (decisionTree.findById(form.selectedDecisionId).getType()) {
      case DecisionType.STAFF:
      case DecisionType.PRISONER:
      case DecisionType.OFFICER:
        setSessionDecisionForm(res, {
          selectedDecisionId: form.selectedDecisionId,
          selectedDecisionData: { userId: redirectData },
        })
        break
      default:
        break
    }
  }
}

export function viewDataFromDecisionForm(form?: DecisionForm) {
  if (form && form?.selectedDecisionId) {
    switch (decisionTree.findById(form.selectedDecisionId).getType()) {
      case DecisionType.OFFICER:
        return { name: 'TODO' }
      default:
        break
    }
  }
  return {}
}

export function decisionFormFromPost(req: Request): DecisionForm {
  const { selectedDecisionId } = req.body
  if (selectedDecisionId) {
    switch (decisionTree.findById(selectedDecisionId).getType()) {
      case DecisionType.STAFF:
      case DecisionType.PRISONER:
      case DecisionType.OFFICER:
        return {
          selectedDecisionId,
          selectedDecisionData: {
            userId: req.body[`userId${selectedDecisionId}`],
            userSearchInput: req.body[`userSearchInput${selectedDecisionId}`],
          },
        }
      default:
        return {
          selectedDecisionId,
        }
        break
    }
  }
  return {}
}
