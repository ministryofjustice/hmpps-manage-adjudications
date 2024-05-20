import { FormError } from '../../../../@types/template'

type ValidationForm = {
  activityDescription: string
  monitorName: string
  endDate: string
  numberOfSessions: number
}

const errors: { [key: string]: FormError } = {
  MISSING_DESCRIPTION: {
    href: '#activityDescription',
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
    href: '#numberOfSessions',
    text: 'Number of sessions must be a number',
  },
}

export default function validateForm({
  activityDescription,
  monitorName,
  endDate,
  numberOfSessions,
}: ValidationForm): FormError | null {
  if (numberOfSessions && Number.isNaN(numberOfSessions)) return errors.TYPE_SESSION_NUMBER
  if (!activityDescription) return errors.MISSING_DESCRIPTION
  if (!monitorName) return errors.MISSING_NAME
  if (!endDate) return errors.MISSING_DATE

  return null
}
