import { Request } from 'express'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { DecisionType } from '../../offenceCodeDecisions/Decision'
import { DecisionForm, PrisonerData, StaffData, OfficerData } from './decisionForm'

// Methods to deal with add, removing and parsing a DecisionFrom from the session and requests.
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

export function updateSessionDecisionForm(res: Request, redirectData: string, draftAdjudicationNumber: string) {
  const form = getSessionDecisionForm(res, draftAdjudicationNumber)
  if (form) {
    switch (decisionTree.findById(form.selectedDecisionId).getType()) {
      case DecisionType.STAFF:
        ;(form.selectedDecisionData as StaffData).staffId = redirectData
        break
      case DecisionType.PRISONER:
        ;(form.selectedDecisionData as PrisonerData).prisonerId = redirectData
        break
      case DecisionType.OFFICER:
        ;(form.selectedDecisionData as OfficerData).officerId = redirectData
        break
      default:
        break
    }
  }
}

// This method is tightly bound to the parameters in the njk files.
export function decisionFormFromPost(req: Request): DecisionForm {
  const { selectedDecisionId } = req.body
  if (selectedDecisionId) {
    switch (decisionTree.findById(selectedDecisionId).getType()) {
      case DecisionType.STAFF:
        return {
          selectedDecisionId,
          selectedDecisionData: {
            staffId: req.body.staffId,
            staffSearchFirstNameInput: req.body.staffSearchFirstNameInput,
            staffSearchLastNameInput: req.body.staffSearchLastNameInput,
          },
        }
      case DecisionType.OFFICER:
        return {
          selectedDecisionId,
          selectedDecisionData: {
            officerId: req.body.officerId,
            officerSearchFirstNameInput: req.body.officerSearchFirstNameInput,
            officerSearchLastNameInput: req.body.officerSearchLastNameInput,
          },
        }
      case DecisionType.PRISONER:
        return {
          selectedDecisionId,
          selectedDecisionData: {
            prisonerId: req.body.prisonerId,
            prisonerSearchNameInput: req.body.prisonerSearchNameInput,
          },
        }
      case DecisionType.ANOTHER:
        return {
          selectedDecisionId,
          selectedDecisionData: {
            anotherNameInput: req.body.anotherNameInput,
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

// This method is tightly bound to the search functionality to find a prisoner and a member of staff.
export function getRedirectUrlForUserSearch(form: DecisionForm): {
  pathname: string
  query: { [key: string]: string }
} {
  switch (decisionTree.findById(form.selectedDecisionId).getType()) {
    case DecisionType.OFFICER:
      return {
        pathname: '/select-associated-staff',
        query: {
          staffFirstName: (form.selectedDecisionData as OfficerData).officerSearchFirstNameInput,
          staffLastName: (form.selectedDecisionData as OfficerData).officerSearchLastNameInput,
        },
      }
    case DecisionType.STAFF:
      return {
        pathname: '/select-associated-staff',
        query: {
          staffFirstName: (form.selectedDecisionData as StaffData).staffSearchFirstNameInput,
          staffLastName: (form.selectedDecisionData as StaffData).staffSearchLastNameInput,
        },
      }
    case DecisionType.PRISONER:
      return {
        pathname: '/select-associated-prisoner',
        query: {
          searchTerm: (form.selectedDecisionData as PrisonerData).prisonerSearchNameInput,
        },
      }
    default:
      throw new Error(`There is no search url for type: ${decisionTree.findById(form.selectedDecisionId).getType()}`)
  }
}
