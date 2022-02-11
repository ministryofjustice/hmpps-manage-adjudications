import { Request, Response } from 'express'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { DecisionType } from '../../offenceCodeDecisions/Decision'
import { DecisionForm, SelectPrisonerData, SelectStaffData } from './decisionForm'

// Methods to deal with add, removing and parsing a DecisionFrom from the session and requests
export function setSessionDecisionForm(req: Request, form: DecisionForm) {
  req.session.sessionDecisionForm = form
}

function getSessionDecisionForm(req: Request): DecisionForm {
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
        form.selectedDecisionData.userId = redirectData
        break
      default:
        break
    }
  }
}

export function decisionFormFromPost(req: Request): DecisionForm {
  const { selectedDecisionId } = req.body
  if (selectedDecisionId) {
    switch (decisionTree.findById(selectedDecisionId).getType()) {
      case DecisionType.STAFF:
      case DecisionType.OFFICER:
        return {
          selectedDecisionId,
          selectedDecisionData: {
            userId: req.body[`userId${selectedDecisionId}`],
            userSearchFirstNameInput: req.body[`userSearchFirstNameInput${selectedDecisionId}`],
            userSearchLastNameInput: req.body[`userSearchLastNameInput${selectedDecisionId}`],
          },
        }
      case DecisionType.PRISONER:
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

export function getRedirectUrlForUserSearch(form: DecisionForm): string {
  switch (decisionTree.findById(form.selectedDecisionId).getType()) {
    case DecisionType.OFFICER:
    case DecisionType.STAFF:
      return `/select-associated-staff?staffFirstName=${
        (form.selectedDecisionData as SelectStaffData).userSearchFirstNameInput
      }&staffLastName=${(form.selectedDecisionData as SelectStaffData).userSearchLastNameInput}`
    case DecisionType.PRISONER:
      return this.redirect(
        `/select-associated-prisoner?searchTerm=${(form.selectedDecisionData as SelectPrisonerData).userSearchInput}`
      )
    default:
      throw new Error(`There is no search url for type: ${decisionTree.findById(form.selectedDecisionId).getType()}`)
  }
}
