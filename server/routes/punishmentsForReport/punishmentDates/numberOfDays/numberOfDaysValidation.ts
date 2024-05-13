import { FormError } from '../../../../@types/template'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import validatePunishmentDays from '../../punishments/punishmentDaysValidator'

type PunishmentScheduleForm = {
  punishmentType: PunishmentType
  duration: number
  isYOI: boolean
  privilegeType?: PrivilegeType
}

const errors: { [key: string]: FormError } = {
  MISSING_DAYS: {
    href: '#duration',
    text: 'Enter how many days the punishment will last',
  },
  DAYS_TOO_FEW: {
    href: '#duration',
    text: 'Enter one or more days',
  },
}

export default function validateForm({
  punishmentType,
  duration,
  isYOI,
  privilegeType,
}: PunishmentScheduleForm): FormError | null {
  if (Number.isInteger(duration) && duration <= 0) return errors.DAYS_TOO_FEW
  if (duration === undefined || duration === null || !duration) return errors.MISSING_DAYS

  return validatePunishmentDays(punishmentType, duration, isYOI, privilegeType)
}
