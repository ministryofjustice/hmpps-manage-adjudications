import { FormError } from '../../@types/template'
import { DecisionForm, SelectPrisonerData, SelectStaffData } from './decisionForm'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { DecisionType } from '../../offenceCodeDecisions/Decision'

export default function validateForm(decisionForm: DecisionForm): FormError | null {
  const { selectedDecisionId } = decisionForm
  if (!selectedDecisionId) {
    return {
      href: '#selectedDecisionId',
      text: 'Please make a choice',
    }
  }
  switch (decisionTree.findById(selectedDecisionId).getType()) {
    case DecisionType.STAFF:
    case DecisionType.OFFICER:
      if (!decisionForm.selectedDecisionData.userId) {
        if (
          !(decisionForm.selectedDecisionData as SelectStaffData).userSearchFirstNameInput &&
          !(decisionForm.selectedDecisionData as SelectStaffData).userSearchLastNameInput
        ) {
          return {
            href: `#userSearchFullNameInput${selectedDecisionId}`,
            text: 'Enter their name',
          }
        }
        if (!(decisionForm.selectedDecisionData as SelectStaffData).userSearchFirstNameInput) {
          return {
            href: `#userSearchFirstNameInput${selectedDecisionId}`,
            text: 'Enter their name',
          }
        }
        if (!(decisionForm.selectedDecisionData as SelectStaffData).userSearchLastNameInput) {
          return {
            href: `#userSearchLastNameInput${selectedDecisionId}`,
            text: 'Enter their name',
          }
        }
        return {
          href: `#userSearchFullNameInput${selectedDecisionId}`,
          text: 'TODO message',
        }
      }
      break
    case DecisionType.PRISONER:
      if (!decisionForm.selectedDecisionData.userId) {
        if (!(decisionForm.selectedDecisionData as SelectPrisonerData).userSearchInput) {
          return {
            href: `#userSearchInput${selectedDecisionId}`,
            text: 'Enter their name or prison number',
          }
        }
        return {
          href: `#userSearchInput${selectedDecisionId}`,
          text: 'TODO message',
        }
      }
      break
    default:
      break
  }
  return null
}
