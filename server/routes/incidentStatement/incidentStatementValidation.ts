import { FormError } from '../../@types/template'

type incidentStatementForm = {
  incidentStatement?: string
  incidentStatementComplete?: string
  adjudicationEdited?: boolean
}

const errors: { [key: string]: FormError } = {
  MISSING_TEXT: {
    href: '#incidentStatement',
    text: 'Enter the details of the incident',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#incidentStatement',
    text: 'Your statement must be 4,000 characters or fewer',
  },
  RADIO_OPTION_MISSING: {
    href: '#incidentStatementComplete',
    text: 'Select yes if you’ve completed your statement',
  },
}

export default function validateForm({
  incidentStatement,
  incidentStatementComplete,
  adjudicationEdited,
}: incidentStatementForm): FormError | null {
  if (!incidentStatementComplete && !adjudicationEdited) return errors.RADIO_OPTION_MISSING

  if (incidentStatement.length > 4000) return errors.WORD_COUNT_EXCEEDED

  if (incidentStatementComplete === 'yes' && !incidentStatement) return errors.MISSING_TEXT

  return null
}
