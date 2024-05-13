import { FormError } from '../../../../@types/template'
import { PrivilegeType, PunishmentType } from '../../../../data/PunishmentResult'
import validatePunishmentDays from '../../punishments/punishmentDaysValidator'

type startDateDateForm = {
  startDate?: string
  punishmentType?: PunishmentType
  duration?: number
  isYOI?: boolean
  privilegeType: PrivilegeType
}

const errors: { [key: string]: FormError } = {
  MISSING_DATE: {
    href: '#startDate',
    text: 'Enter the date the punishment will start',
  },
}

export default function validateForm({
  startDate,
  punishmentType,
  duration,
  isYOI,
  privilegeType,
}: startDateDateForm): FormError | null {
  if (!startDate) return errors.MISSING_DATE
  return validatePunishmentDays(punishmentType, duration, isYOI, privilegeType)
}
