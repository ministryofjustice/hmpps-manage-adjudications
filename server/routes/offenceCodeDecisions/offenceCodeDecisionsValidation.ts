import { FormError } from '../../@types/template'
import { DecisionForm } from './decisionForm'
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
    case DecisionType.PRISONER:
    case DecisionType.OFFICER:
      if (!decisionForm.selectedDecisionData.userId) {
        return {
          href: `#userSearchInput${selectedDecisionId}`,
          text: 'Enter their name or user Id',
        }
      }
      break
    default:
      break
  }
  return null
}
