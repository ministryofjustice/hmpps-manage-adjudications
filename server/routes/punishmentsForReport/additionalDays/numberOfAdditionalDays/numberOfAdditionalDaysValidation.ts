import { FormError } from '../../../../@types/template'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import validatePunishmentDays from '../../punishments/punishmentDaysValidator'

type NumberOfAddedDaysForm = {
  punishmentType: PunishmentType
  duration: number
  isYOI: boolean
  privilegeType?: PrivilegeType
}

const errors: { [key: string]: FormError } = {
  NOT_NUMERICAL: {
    href: '#duration',
    text: 'Enter a number of days',
  },
  DAYS_TOO_FEW: {
    href: '#duration',
    text: 'Enter one or more days',
  },
  MISSING_DAYS: {
    href: '#duration',
    text: 'Enter how many days the punishment will last',
  },
}

export default function validateForm({
  punishmentType,
  duration,
  isYOI,
  privilegeType,
}: NumberOfAddedDaysForm): FormError | null {
  if (duration === undefined || duration === null) return errors.MISSING_DAYS
  if (!Number.isInteger(+duration)) return errors.NOT_NUMERICAL
  if (Number.isInteger(+duration) && duration <= 0) return errors.DAYS_TOO_FEW

  return validatePunishmentDays(punishmentType, duration, isYOI, privilegeType)
}
