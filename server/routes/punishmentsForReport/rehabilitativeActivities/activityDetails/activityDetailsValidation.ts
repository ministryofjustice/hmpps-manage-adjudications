import moment from 'moment'
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
  if (totalSessions && !Number.isInteger(+totalSessions))
    return {
      href: '#totalSessions',
      text: 'Number of sessions must be a number',
    }

  return null
}

type CompletionDateForm = {
  endDate: string
  // YYYY-MM-DD
  latestDate: string
  coversSeveralPunishments: boolean
}

// The activity has to be finished by the time the punishment it is attached to stops being suspended
export function validateCompletionDate({
  endDate,
  latestDate,
  coversSeveralPunishments,
}: CompletionDateForm): FormError | null {
  if (!endDate || !latestDate) return null
  const completion = moment(endDate, ['D/M/YYYY', 'DD/MM/YYYY'], true)
  if (!completion.isValid()) {
    return { href: '#endDate', text: 'Completion date must be a real date, like 21/9/2026' }
  }
  const latest = moment(latestDate, 'YYYY-MM-DD')
  if (completion.isAfter(latest, 'day')) {
    const latestText = latest.format('D MMMM YYYY')
    return {
      href: '#endDate',
      text: coversSeveralPunishments
        ? `Completion date must be on or before ${latestText}, the earliest date these punishments are suspended until`
        : `Completion date must be on or before ${latestText}, the date the punishment is suspended until`,
    }
  }
  return null
}
