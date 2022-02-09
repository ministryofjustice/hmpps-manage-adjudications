import { FormError } from '../../@types/template'
import { DecisionForm } from './decisionForm'

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_SELECTION = 'MISSING_SELECTION',
}

const errors: { [key in ErrorType]: FormError } = {
  MISSING_SELECTION: {
    href: '#selectedDecisionId',
    text: 'Please make a choice',
  },
}

export default function validateForm(decisionForm: DecisionForm): FormError | null {
  if (!decisionForm.selectedDecisionId) {
    return errors.MISSING_SELECTION
  }
  return null
}
