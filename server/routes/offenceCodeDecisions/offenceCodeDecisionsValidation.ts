import { FormError } from '../../@types/template'
import { DecisionForm } from './decisionForm'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { DecisionType } from '../../offenceCodeDecisions/Decision'

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_SELECTION = 'MISSING_SELECTION',
  MISSING_USER_ID = 'MISSING_USER_ID',
}

const errors: { [key in ErrorType]: FormError } = {
  MISSING_SELECTION: {
    href: '#selectedDecisionId',
    text: 'Please make a choice',
  },
  MISSING_USER_ID: {
    href: '#userSearchInput',
    text: 'TODO',
  },
}

export default function validateForm(decisionForm: DecisionForm): FormError | null {
  const { selectedDecisionId } = decisionForm
  if (!selectedDecisionId) {
    return errors.MISSING_SELECTION
  }
  switch (decisionTree.findById(selectedDecisionId).getType()) {
    case DecisionType.STAFF:
    case DecisionType.PRISONER:
    case DecisionType.OFFICER:
      if (!decisionForm.selectedDecisionData.userId) {
        return errors.MISSING_USER_ID
      }
      break
    default:
      break
  }
  return null
}
