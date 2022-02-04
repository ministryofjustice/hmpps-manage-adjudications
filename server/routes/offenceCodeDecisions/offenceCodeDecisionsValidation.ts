import { FormError } from '../../@types/template'

type DecisionForm = {
  selectedDecisionId?: string
}

type ErrorType = 'MISSING_SELECTION'

const errors: { [key in ErrorType]: FormError } = {
  MISSING_SELECTION: {
    href: '#selectedDecisionId',
    text: 'Please make a choice', // TODO correct message
  },
}

export default function validateForm({ selectedDecisionId }: DecisionForm): FormError | null {
  if (!selectedDecisionId) {
    return errors.MISSING_SELECTION
  }
  return null
}
