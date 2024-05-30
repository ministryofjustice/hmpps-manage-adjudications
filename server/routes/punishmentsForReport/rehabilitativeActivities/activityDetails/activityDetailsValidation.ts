import { FormError } from '../../../../@types/template'

type ValidationForm = {
  details: string
  monitorName: string
  endDate: string
  totalSessions: number
  prisonerName: string
}

export default function validateForm({
  prisonerName,
  details,
  monitorName,
  endDate,
  totalSessions,
}: ValidationForm): FormError | null {
  if (totalSessions && !Number.isInteger(totalSessions))
    return {
      href: '#totalSessions',
      text: 'Number of sessions must be a number',
    }
  if (!details) {
    return {
      href: '#details',
      text: `Enter the activity ${prisonerName || 'the prisoner'} will be doing`,
    }
  }
  if (!monitorName) {
    return {
      href: '#monitorName',
      text: `Enter who is monitoring ${prisonerName || 'the prisoner'} on the activity`,
    }
  }
  if (!endDate) {
    return {
      href: '#endDate',
      text: 'Enter when the activity should be completed by',
    }
  }

  return null
}
