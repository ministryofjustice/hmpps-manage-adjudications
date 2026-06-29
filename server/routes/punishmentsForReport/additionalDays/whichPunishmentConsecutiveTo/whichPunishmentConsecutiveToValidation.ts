import { FormError } from '../../../../@types/template'
import { ConsecutiveAdditionalDaysReport } from '../../../../data/manageAdjudicationsUserTokensClient'

type WhichPunishmentConsecutiveToForm = {
  chargeNumber: string
  selectedChargeNumber?: string
  possibleConsecutivePunishments: ConsecutiveAdditionalDaysReport[]
}

const errors: { [key: string]: FormError } = {
  CONSECUTIVE_LOOP: {
    href: '#consecutive-punishments-table',
    text: 'You cannot select this punishment because it is already consecutive to this charge',
  },
}

export default function validateForm({
  chargeNumber,
  selectedChargeNumber,
  possibleConsecutivePunishments,
}: WhichPunishmentConsecutiveToForm): FormError | null {
  if (!selectedChargeNumber) return null

  const selected = possibleConsecutivePunishments.find(report => report.chargeNumber === selectedChargeNumber)
  if (selected && selected.punishment.consecutiveChargeNumber === chargeNumber) {
    return errors.CONSECUTIVE_LOOP
  }

  return null
}
