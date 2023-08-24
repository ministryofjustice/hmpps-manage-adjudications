import { FormError } from '../../@types/template'
import { PrivilegeType, PunishmentType } from '../../data/PunishmentResult'
import { datePickerToApi } from '../../utils/utils'
import validatePunishmentDays from '../punishments/punishmentDaysValidator'

type PunishmentScheduleForm = {
  punishmentType: PunishmentType
  days: number
  suspended?: string
  suspendedUntil?: string
  startDate?: string
  endDate?: string
  isYOI: boolean
  privilegeType?: PrivilegeType
  otherPrivilege?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_DAYS: {
    href: '#days',
    text: 'Enter how many days the punishment will last',
  },
  DAYS_TOO_FEW: {
    href: '#days',
    text: 'Enter one or more days',
  },
  MISSING_SUSPENDED_DECISION: {
    href: '#suspended',
    text: 'Select yes if this punishment is to be suspended',
  },
  MISSING_SUSPENDED_UNTIL: {
    href: '#suspendedUntil',
    text: 'Enter the date the punishment is suspended until',
  },
  MISSING_START_DATE: {
    href: '#startDate',
    text: 'Enter the date this punishment will start',
  },
  MISSING_END_DATE: {
    href: '#endDate',
    text: 'Enter the last day of this punishment',
  },
  END_DATE_BEFORE_START_DATE: {
    href: '#endDate',
    text: 'Enter an end date that is after the start date',
  },
}

export default function validateForm({
  punishmentType,
  days,
  suspended,
  suspendedUntil,
  startDate,
  endDate,
  isYOI,
  privilegeType,
  otherPrivilege,
}: PunishmentScheduleForm): FormError | null {
  if (Number.isInteger(days) && days <= 0) return errors.DAYS_TOO_FEW
  if (days === undefined || days === null || !days) return errors.MISSING_DAYS
  if (!suspended) return errors.MISSING_SUSPENDED_DECISION
  if (suspended === 'yes' && !suspendedUntil) return errors.MISSING_SUSPENDED_UNTIL
  if (suspended === 'no' && !startDate) {
    if ([PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(punishmentType)) return null
    return errors.MISSING_START_DATE
  }
  if (suspended === 'no' && !endDate) {
    if ([PunishmentType.ADDITIONAL_DAYS, PunishmentType.PROSPECTIVE_DAYS].includes(punishmentType)) return null
    return errors.MISSING_END_DATE
  }
  if (datePickerToApi(endDate) < datePickerToApi(startDate)) return errors.END_DATE_BEFORE_START_DATE

  return validatePunishmentDays(punishmentType, days, isYOI, privilegeType, otherPrivilege)
}
