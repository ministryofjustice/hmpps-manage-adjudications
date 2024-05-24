import { FormError } from '../../../../@types/template'
import { NotCompletedOutcome } from '../../../../data/PunishmentResult'
import { isValidDateTimeFormat, possessive } from '../../../../utils/utils'

type NotCompletedForm = {
  outcome: NotCompletedOutcome
  daysToActivate: number
  suspendedUntil: string
  prisonerName: string
}

export default function validateForm({
  outcome,
  daysToActivate,
  suspendedUntil,
  prisonerName,
}: NotCompletedForm): FormError | null {
  if (!outcome) {
    return {
      href: '#outcome',
      text: `Select what happens to ${possessive(prisonerName)} suspended punishment`,
    }
  }
  if (outcome === NotCompletedOutcome.PARTIAL_ACTIVATE) {
    if (!daysToActivate) {
      return {
        href: '#daysToActivate',
        text: `Enter the number of days for the punishment`,
      }
    }
    if (Number.isNaN(Number(daysToActivate))) {
      return {
        href: '#daysToActivate',
        text: `The number of days for the punishment must be a number`,
      }
    }
    if (daysToActivate > 7) {
      return {
        href: '#daysToActivate',
        text: `The number of days for the punishment must be 7 or fewer`,
      }
    }
  }
  if (outcome === NotCompletedOutcome.EXT_SUSPEND) {
    if (!suspendedUntil) {
      return {
        href: '#suspendedUntil',
        text: `Enter the new date the suspended punishment will end`,
      }
    }
    if (isValidDateTimeFormat(suspendedUntil)) {
      return {
        href: '#suspendedUntil',
        text: `The new date the suspended punishment will end must be a real date`,
      }
    }
  }

  return null
}
