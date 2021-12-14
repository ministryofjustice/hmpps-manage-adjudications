import { FormError } from '../../@types/template'

type incidentStatementForm = {
  incidentStatement?: string
  incidentStatementComplete?: string
  adjudicationEdited?: boolean
}

const errors: { [key: string]: FormError } = {
  MISSING_TEXT: {
    href: '#incidentStatement',
    text: 'Write the full details of the alleged offence',
  },
  WORD_COUNT_EXCEEDED: {
    href: '#incidentStatement',
    text: 'Write your statement using 4,000 characters or less',
  },
  RADIO_OPTION_MISSING: {
    href: '#incidentStatementComplete',
    text: 'Select yes if you have completed your statement',
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
