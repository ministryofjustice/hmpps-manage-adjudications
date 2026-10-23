import { FormError } from '../../../@types/template'
import {
  PrivilegeType,
  PunishmentType,
  convertPunishmentType,
  isSocialVisitsPunishment,
} from '../../../data/PunishmentResult'

type PunishmentForm = {
  punishmentType: PunishmentType
  privilegeType?: PrivilegeType
  privilegeTypes?: PrivilegeType[]
  multiplePrivileges?: boolean
  otherPrivilege?: string
  stoppagePercentage?: number
  damagesOwedAmount?: number
  damagesAlreadyAdded?: boolean
  // privileges other than Other can only be withdrawn once on a charge
  privilegesAlreadyAdded?: PrivilegeType[]
  hasChildUnder18?: boolean
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
  MISSING_PRIVILEGE_TYPES: {
    href: '#privilegeTypes',
    text: 'Select which privileges will be withdrawn',
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
  MISSING_CHILD_UNDER_18_LOSS_OF_SOCIAL_VISITS: {
    href: '#lossHasChildUnder18',
    text: 'Select whether the prisoner has any children under 18',
  },
  MISSING_CHILD_UNDER_18_RESTRICTION_OF_SOCIAL_VISITS: {
    href: '#restrictionHasChildUnder18',
    text: 'Select whether the prisoner has any children under 18',
  },
}

export default function validateForm({
  punishmentType,
  privilegeType,
  privilegeTypes = [],
  multiplePrivileges = false,
  otherPrivilege,
  stoppagePercentage,
  damagesOwedAmount,
  damagesAlreadyAdded,
  privilegesAlreadyAdded = [],
  hasChildUnder18,
}: PunishmentForm): FormError | null {
  if (!punishmentType) {
    if (damagesAlreadyAdded) {
      return errors.MISSING_PUNISHMENT_TYPE_DAMAGES_PRESENT
    }
    return errors.MISSING_PUNISHMENT_TYPE
  }

  if (isSocialVisitsPunishment(punishmentType) && hasChildUnder18 === undefined) {
    return punishmentType === PunishmentType.LOSS_OF_SOCIAL_VISITS
      ? errors.MISSING_CHILD_UNDER_18_LOSS_OF_SOCIAL_VISITS
      : errors.MISSING_CHILD_UNDER_18_RESTRICTION_OF_SOCIAL_VISITS
  }

  if (punishmentType === PunishmentType.PRIVILEGE && multiplePrivileges) {
    if (!privilegeTypes.length) return errors.MISSING_PRIVILEGE_TYPES
  } else if (punishmentType === PunishmentType.PRIVILEGE && !privilegeType) return errors.MISSING_PRIVILEGE_TYPE

  if (punishmentType === PunishmentType.PRIVILEGE) {
    const chosen = multiplePrivileges ? privilegeTypes : [privilegeType]
    const alreadyAdded = chosen.find(
      privilege => privilege !== PrivilegeType.OTHER && privilegesAlreadyAdded.includes(privilege),
    )
    if (alreadyAdded) {
      return {
        href: multiplePrivileges ? '#privilegeTypes' : '#privilegeType',
        text: `${convertPunishmentType(PunishmentType.PRIVILEGE, null, alreadyAdded, null)} has already been added. Select a different privilege`,
      }
    }
  }

  const otherPrivilegeChosen = multiplePrivileges
    ? privilegeTypes.includes(PrivilegeType.OTHER)
    : privilegeType === PrivilegeType.OTHER
  if (punishmentType === PunishmentType.PRIVILEGE && otherPrivilegeChosen) {
    if (!otherPrivilege?.trim()) return errors.MISSING_OTHER_PRIVILEGE
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
