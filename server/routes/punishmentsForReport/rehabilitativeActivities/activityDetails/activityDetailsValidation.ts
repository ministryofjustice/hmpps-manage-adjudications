import { FormError } from '../../../../@types/template'

type ValidationForm = {
  details: string
  monitorName: string
  endDate: string
  totalSessions: number
}

const errors: { [key: string]: FormError } = {
  MISSING_DESCRIPTION: {
    href: '#details',
    text: 'Enter the activity the prisoner will be doing',
  },
  MISSING_NAME: {
    href: '#monitorName',
    text: 'Enter who is monitoring the prisoner on the activity',
  },
  MISSING_DATE: {
    href: '#endDate',
    text: 'Enter when the activity should be completed by',
  },
  TYPE_SESSION_NUMBER: {
    href: '#totalSessions',
    text: 'Number of sessions must be a number',
  },
}

export default function validateForm({
  details,
  monitorName,
  endDate,
  totalSessions,
}: ValidationForm): FormError | null {
  if (totalSessions && Number.isNaN(totalSessions)) return errors.TYPE_SESSION_NUMBER
  if (!details) return errors.MISSING_DESCRIPTION
  if (!monitorName) return errors.MISSING_NAME
  if (!endDate) return errors.MISSING_DATE

  return null
}
