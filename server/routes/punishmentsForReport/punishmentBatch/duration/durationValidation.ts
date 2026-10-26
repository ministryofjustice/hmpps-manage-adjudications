import moment from 'moment'
import type { FormError } from '../../../../@types/template'
import type { PunishmentBatchItem } from '../../../../data/PunishmentResult'
import validateNumberOfDays from '../../punishmentDates/numberOfDays/numberOfDaysValidation'

export enum StartMode {
  IMMEDIATE = 'IMMEDIATE',
  LATER = 'LATER',
  SUSPENDED = 'SUSPENDED',
}

type DurationForm = {
  duration?: string
  startMode?: string
  startDate?: string
  suspendedUntil?: string
  // the punishments the answers will apply to — more than one when "same for all" was chosen
  punishments: PunishmentBatchItem[]
  isYOI: boolean
  // last day of the hearing, YYYY-MM-DD
  lastHearingDate: string
}

const DATE_PICKER_FORMATS = ['D/M/YYYY', 'DD/MM/YYYY']

export const parseDatePickerDate = (value: string): moment.Moment => {
  const date = moment(String(value || '').trim(), DATE_PICKER_FORMATS, true)
  return date.isValid() ? date : null
}

const example = (lastHearingDate: string, days: number) =>
  moment(lastHearingDate || undefined)
    .add(days, 'days')
    .format('D/M/YYYY')

export default function validateForm({
  duration,
  startMode,
  startDate,
  suspendedUntil,
  punishments,
  isYOI,
  lastHearingDate,
}: DurationForm): FormError[] {
  const errors: FormError[] = []
  const thesePunishments = punishments.length > 1 ? 'the punishments' : 'this punishment'
  const hearingDay = lastHearingDate ? moment(lastHearingDate, 'YYYY-MM-DD') : null
  const hearingDayText = hearingDay?.format('D MMMM YYYY')

  const days = String(duration ?? '').trim()
  if (days && !/^\d+$/.test(days)) {
    errors.push({ href: '#duration', text: 'Number of days must be a whole number, like 21' })
  } else {
    // the same maximums as the number of days page, checked for every punishment the answer applies to
    const daysError = punishments
      .map(punishment =>
        validateNumberOfDays({
          duration: days ? Number(days) : null,
          punishmentType: punishment.type,
          isYOI,
          privilegeType: punishment.privilegeType,
        }),
      )
      .find(Boolean)
    if (daysError) {
      errors.push(daysError)
    }
  }

  if (!Object.values(StartMode).includes(startMode as StartMode)) {
    errors.push({ href: '#startMode', text: `Select when ${thesePunishments} will take effect` })
  }

  if (startMode === StartMode.LATER) {
    const date = parseDatePickerDate(startDate)
    if (!startDate?.trim()) {
      errors.push({ href: '#startDate', text: 'Enter the date the punishment will start' })
    } else if (!date) {
      errors.push({
        href: '#startDate',
        text: `Start date must be a real date, like ${example(lastHearingDate, 1)}`,
      })
    } else if (hearingDay && !date.isAfter(hearingDay, 'day')) {
      errors.push({
        href: '#startDate',
        text: `Start date must be after the last day of the hearing, ${hearingDayText}`,
      })
    }
  }

  if (startMode === StartMode.SUSPENDED) {
    const date = parseDatePickerDate(suspendedUntil)
    if (!suspendedUntil?.trim()) {
      errors.push({ href: '#suspendedUntil', text: 'Enter the date the punishment is suspended until' })
    } else if (!date) {
      errors.push({
        href: '#suspendedUntil',
        text: `Date suspended until must be a real date, like ${example(lastHearingDate, 30)}`,
      })
    } else if (hearingDay && !date.isAfter(hearingDay, 'day')) {
      errors.push({
        href: '#suspendedUntil',
        text: `Date suspended until must be after the last day of the hearing, ${hearingDayText}`,
      })
    }
  }

  return errors
}
