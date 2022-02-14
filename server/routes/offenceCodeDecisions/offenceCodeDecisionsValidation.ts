import { FormError } from '../../@types/template'
import { DecisionForm, SelectPrisonerData, SelectStaffData } from './decisionForm'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { DecisionType } from '../../offenceCodeDecisions/Decision'

// What is valid depends on whether this is a normal submit or one searching for a user.
// This method is tightly bound to the njk page validation names.
export default function validateForm(decisionForm: DecisionForm, searching: boolean): FormError[] | null {
  const { selectedDecisionId } = decisionForm
  if (!selectedDecisionId) {
    return [
      {
        href: '#selectedDecisionId',
        text: 'Please make a choice',
      },
    ]
  }
  switch (decisionTree.findById(selectedDecisionId).getType()) {
    case DecisionType.STAFF:
    case DecisionType.OFFICER:
      if (!decisionForm.selectedDecisionData.userId) {
        if (searching) {
          const errors = []
          if (!(decisionForm.selectedDecisionData as SelectStaffData).userSearchFirstNameInput) {
            errors.push({
              href: `#userSearchFirstNameInput${selectedDecisionId}`,
              text: 'Enter their first name',
            })
          }
          if (!(decisionForm.selectedDecisionData as SelectStaffData).userSearchLastNameInput) {
            errors.push({
              href: `#userSearchLastNameInput${selectedDecisionId}`,
              text: 'Enter their last name',
            })
          }
          return errors
        }
        return [
          {
            href: `#userSearchFirstNameInput${selectedDecisionId}`,
            text: 'Search for a user',
          },
          {
            href: `#userSearchLastNameInput${selectedDecisionId}`,
            text: 'Search for a user',
          },
        ]
      }
      break
    case DecisionType.PRISONER:
      if (!decisionForm.selectedDecisionData.userId) {
        if (!(decisionForm.selectedDecisionData as SelectPrisonerData).userSearchInput) {
          return [
            {
              href: `#userSearchInput${selectedDecisionId}`,
              text: 'Enter their name or prison number',
            },
          ]
        }
        if (!searching) {
          return [
            {
              href: `#userSearchInput${selectedDecisionId}`,
              text: 'Search for a prisoner',
            },
          ]
        }
      }
      break
    default:
      break
  }
  return null
}
