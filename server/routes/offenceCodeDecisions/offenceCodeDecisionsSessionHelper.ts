// TODO all this in a helper class.
// Method to generate a DecisionForm backing object with data returned from a redirect
import { Request, Response } from 'express'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { DecisionType } from '../../offenceCodeDecisions/Decision'
import { DecisionForm } from './decisionForm'

export function setSessionDecisionForm(res: Response, form: DecisionForm) {
  res.locals.sessionDecisionForm = form
}

function getSessionDecisionForm(res: Response) {
  return res.locals.sessionDecisionForm as DecisionForm
}

export function getAndDeleteSessionDecisionForm(res: Response): DecisionForm {
  const sessionDecisionForm = getSessionDecisionForm(res)
  setSessionDecisionForm(res, null)
  return sessionDecisionForm
}

export function updateSessionDecisionForm(res: Response, redirectData: string) {
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
