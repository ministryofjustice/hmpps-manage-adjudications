import { FormError } from '../../../@types/template'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'
import validatePunishmentDays from '../../punishments/punishmentDaysValidator'

type PunishmentStartDateChoiceForm = {
  immediate: string
  isYOI: boolean
  punishmentType: PunishmentType
  privilegeType?: PrivilegeType
  days: number
}

const errors: { [key: string]: FormError } = {
  MISSING_RADIO: {
    href: '#immediate',
    text: 'Select when this punishment starts',
  },
}

export default function validateForm({
  immediate,
  isYOI,
  punishmentType,
  privilegeType,
  days,
}: PunishmentStartDateChoiceForm): FormError | null {
  if (!immediate) return errors.MISSING_RADIO
  return validatePunishmentDays(punishmentType, days, isYOI, privilegeType)
}
