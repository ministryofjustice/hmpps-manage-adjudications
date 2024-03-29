import { FormError } from '../../../@types/template'
import { PrivilegeType, PunishmentType } from '../../../data/PunishmentResult'

type PunishmentForm = {
  punishmentType: PunishmentType
  privilegeType?: PrivilegeType
  otherPrivilege?: string
  stoppagePercentage?: number
  damagesOwedAmount?: number
  damagesAlreadyAdded?: boolean
}

const errors: { [key: string]: FormError } = {
  MISSING_PUNISHMENT_TYPE: {
    href: '#punishmentType',
    text: 'Select a punishment or recovery of money for damages',
  },
  MISSING_PUNISHMENT_TYPE_DAMAGES_PRESENT: {
    href: '#punishmentType',
    text: 'Select a punishment',
  },
  MISSING_PRIVILEGE_TYPE: {
    href: '#privilegeType',
    text: 'Select the type of privilege',
  },
  MISSING_OTHER_PRIVILEGE: {
    href: '#otherPrivilege',
    text: 'Enter a privilege to be withdrawn',
  },
  OTHER_PRIVILEGE_LENGTH: {
    href: '#otherPrivilege',
    text: 'The privilege must be less than 32 characters',
  },
  MISSING_STOPPAGE_PERCENTAGE: {
    href: '#stoppagePercentage',
    text: 'Enter the percentage of earnings to be stopped',
  },
  STOPPAGE_PERCENTAGE: {
    href: '#stoppagePercentage',
    text: 'Enter a number between 0 and 100',
  },
  MISSING_AMOUNT: {
    href: '#amount',
    text: 'Enter amount being recovered',
  },
  NAN: {
    href: '#amount',
    text: 'Enter the amount in numbers',
  },
}

export default function validateForm({
  punishmentType,
  privilegeType,
  otherPrivilege,
  stoppagePercentage,
  damagesOwedAmount,
  damagesAlreadyAdded,
}: PunishmentForm): FormError | null {
  if (!punishmentType) {
    if (damagesAlreadyAdded) {
      return errors.MISSING_PUNISHMENT_TYPE_DAMAGES_PRESENT
    }
    return errors.MISSING_PUNISHMENT_TYPE
  }

  if (punishmentType === PunishmentType.PRIVILEGE && !privilegeType) return errors.MISSING_PRIVILEGE_TYPE

  if (punishmentType === PunishmentType.PRIVILEGE && privilegeType === PrivilegeType.OTHER) {
    if (!otherPrivilege) return errors.MISSING_OTHER_PRIVILEGE
    if (otherPrivilege.length > 32) return errors.OTHER_PRIVILEGE_LENGTH
  }

  if (punishmentType === PunishmentType.EARNINGS && !stoppagePercentage) return errors.MISSING_STOPPAGE_PERCENTAGE

  if (punishmentType === PunishmentType.EARNINGS && (stoppagePercentage < 1 || stoppagePercentage > 100))
    return errors.STOPPAGE_PERCENTAGE

  if (punishmentType === PunishmentType.DAMAGES_OWED) {
    if (!damagesOwedAmount) {
      return errors.MISSING_AMOUNT
    }
    if (Number.isNaN(Number(damagesOwedAmount))) {
      return errors.NAN
    }
  }

  return null
}
