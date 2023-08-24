import { FormError } from '../../@types/template'
import { convertPrivilegeType, PrivilegeType, PunishmentType } from '../../data/PunishmentResult'

const errors: { [key: string]: FormError } = {
  ADDITIONAL_DAYS_MAX: {
    href: '#days',
    text: 'Number of additional days cannot be more than 42',
  },
  PROSPECTIVE_DAYS_MAX: {
    href: '#days',
    text: 'Number of prospective additional days cannot be more than 42',
  },
  EARNINGS_DAYS_MAX_ADULT: {
    href: '#days',
    text: 'Days for stoppage of earnings cannot be more than 84 for an offence under Adult rules',
  },
  EARNINGS_DAYS_MAX_YOI: {
    href: '#days',
    text: 'Days for stoppage of earnings cannot be more than 42 for an offence under YOI rules',
  },
  EXCLUSION_WORK_DAYS_MAX_ADULT: {
    href: '#days',
    text: 'Days for exclusion from associated work cannot be more than 21 for an offence under Adult rules',
  },
  CONFINEMENT_DAYS_MAX_ADULT: {
    href: '#days',
    text: 'Cellular confinement cannot be more than 21 days for an offence under Adult rules',
  },
  CONFINEMENT_DAYS_MAX_YOI: {
    href: '#days',
    text: 'Cellular confinement cannot be more than 10 days for an offence under YOI rules',
  },
  PRIVILEGE_DAYS_MAX_ADULT: {
    href: '#days',
    text: 'Days for loss of [thing] cannot be more than 42 days for an offence under Adult rules',
  },
  PRIVILEGE_DAYS_MAX_YOI: {
    href: '#days',
    text: 'Days for loss of [thing] cannot be more than 21 days for an offence under YOI rules',
  },
  REMOVAL_WING_DAYS_MAX_ADULT: {
    href: '#days',
    text: 'Days for removal from wing or unit cannot be more than 28 days for an offence under Adult rules',
  },
  REMOVAL_WING_DAYS_MAX_YOI: {
    href: '#days',
    text: 'Days for removal from wing or unit cannot be more than 21 days for an offence under YOI rules',
  },
  REMOVAL_ACTIVITY_MAX_YOI: {
    href: '#days',
    text: 'Days for removal from activity cannot be more than 21 days for an offence under YOI rules',
  },
  EXTRA_WORK_MAX_YOI: {
    href: '#days',
    text: 'Days for extra work cannot be more than 21 days for an offence under YOI rules',
  },
}

export default function validatePunishmentDays(
  punishmentType: PunishmentType,
  days: number,
  isYOI: boolean,
  privilegeType?: PrivilegeType,
  otherPrivilege?: string
): FormError | null {
  if (punishmentType === PunishmentType.ADDITIONAL_DAYS && days > 42) {
    return errors.ADDITIONAL_DAYS_MAX
  }

  if (punishmentType === PunishmentType.PROSPECTIVE_DAYS && days > 42) {
    return errors.PROSPECTIVE_DAYS_MAX
  }

  if (punishmentType === PunishmentType.EARNINGS) {
    if (!isYOI && days > 84) {
      return errors.EARNINGS_DAYS_MAX_ADULT
    }
    if (isYOI && days > 42) {
      return errors.EARNINGS_DAYS_MAX_YOI
    }
  }

  if (punishmentType === PunishmentType.EXCLUSION_WORK && !isYOI && days > 21) {
    return errors.EXCLUSION_WORK_DAYS_MAX_ADULT
  }

  if (punishmentType === PunishmentType.CONFINEMENT) {
    if (!isYOI && days > 21) {
      return errors.CONFINEMENT_DAYS_MAX_ADULT
    }
    if (isYOI && days > 10) {
      return errors.CONFINEMENT_DAYS_MAX_YOI
    }
  }

  if (punishmentType === PunishmentType.PRIVILEGE) {
    if (!isYOI && days > 42) {
      return formatPrivilegeErrorText(
        privilegeType,
        otherPrivilege,
        errors.PRIVILEGE_DAYS_MAX_ADULT.href,
        errors.PRIVILEGE_DAYS_MAX_ADULT.text
      )
    }
    if (isYOI && days > 21) {
      return formatPrivilegeErrorText(
        privilegeType,
        otherPrivilege,
        errors.PRIVILEGE_DAYS_MAX_YOI.href,
        errors.PRIVILEGE_DAYS_MAX_YOI.text
      )
    }
  }

  if (punishmentType === PunishmentType.REMOVAL_WING) {
    if (!isYOI && days > 28) {
      return errors.REMOVAL_WING_DAYS_MAX_ADULT
    }
    if (isYOI && days > 21) {
      return errors.REMOVAL_WING_DAYS_MAX_YOI
    }
  }

  if (punishmentType === PunishmentType.REMOVAL_ACTIVITY && isYOI && days > 21) {
    return errors.REMOVAL_ACTIVITY_MAX_YOI
  }

  if (punishmentType === PunishmentType.EXTRA_WORK && isYOI && days > 21) {
    return errors.EXTRA_WORK_MAX_YOI
  }

  return null
}

function formatPrivilegeErrorText(
  privilegeType: PrivilegeType,
  otherPrivilege: string,
  href: string,
  text: string
): FormError {
  return {
    href,
    text: text.replace(
      '[thing]',
      privilegeType === PrivilegeType.OTHER ? otherPrivilege : convertPrivilegeType(privilegeType)
    ),
  }
}
