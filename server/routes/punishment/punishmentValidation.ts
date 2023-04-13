import { FormError } from '../../@types/template'
import { PrivilegeType, PunishmentType } from '../../data/PunishmentResult'

type PunishmentForm = {
  punishmentType: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
}

const errors: { [key: string]: FormError } = {
  MISSING_PUNISHMENT_TYPE: {
    href: '#punishmentType',
    text: 'Select the type of punishment',
  },
  MISSING_PRIVILEGE_TYPE: {
    href: '#privilegeType',
    text: 'Select the type of privilege',
  },
  MISSING_OTHER_PRIVILEGE: {
    href: '#otherPrivilege',
    text: 'Enter a privilege to be withdrawn',
  },
  MISSING_STOPPAGE_PERCENTAGE: {
    href: '#stoppagePercentage',
    text: 'Enter the loss of privileges',
  },
  STOPPAGE_PERCENTAGE: {
    href: '#stoppagePercentage',
    text: 'Enter a number between 0 and 100',
  },
}

export default function validateForm({
  punishmentType,
  privilegeType,
  otherPrivilege,
  stoppagePercentage,
}: PunishmentForm): FormError | null {
  if (!punishmentType) return errors.MISSING_PUNISHMENT_TYPE

  if (punishmentType === PunishmentType.PRIVILEGE && !privilegeType) return errors.MISSING_PRIVILEGE_TYPE

  if (punishmentType === PunishmentType.PRIVILEGE && privilegeType === PrivilegeType.OTHER && !otherPrivilege)
    return errors.MISSING_OTHER_PRIVILEGE

  if (punishmentType === PunishmentType.EARNINGS && !stoppagePercentage) return errors.MISSING_STOPPAGE_PERCENTAGE

  if (punishmentType === PunishmentType.EARNINGS && (stoppagePercentage < 1 || stoppagePercentage > 100))
    return errors.STOPPAGE_PERCENTAGE
  return null
}
