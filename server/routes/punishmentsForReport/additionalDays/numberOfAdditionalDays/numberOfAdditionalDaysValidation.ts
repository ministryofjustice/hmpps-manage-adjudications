import { FormError } from '../../../../@types/template'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import validatePunishmentDays from '../../punishments/punishmentDaysValidator'

type NumberOfAddedDaysForm = {
  punishmentType: PunishmentType
  days: number
  isYOI: boolean
  privilegeType?: PrivilegeType
}

const errors: { [key: string]: FormError } = {
  NOT_NUMERICAL: {
    href: '#days',
    text: 'Enter a number of days',
  },
  DAYS_TOO_FEW: {
    href: '#days',
    text: 'Enter one or more days',
  },
  MISSING_DAYS: {
    href: '#days',
    text: 'Enter how many days the punishment will last',
  },
}

export default function validateForm({
  punishmentType,
  days,
  isYOI,
  privilegeType,
}: NumberOfAddedDaysForm): FormError | null {
  if (Number.isNaN(days) || typeof days === 'string') return errors.NOT_NUMERICAL
  if (Number.isInteger(days) && days <= 0) return errors.DAYS_TOO_FEW
  if (days === undefined || days === null || !days) return errors.MISSING_DAYS

  return validatePunishmentDays(punishmentType, days, isYOI, privilegeType)
}
