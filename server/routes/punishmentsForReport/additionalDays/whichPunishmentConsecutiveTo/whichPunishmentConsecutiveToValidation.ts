import { FormError } from '../../../../@types/template'
import { ConsecutiveAdditionalDaysReport } from '../../../../data/manageAdjudicationsUserTokensClient'

type WhichPunishmentConsecutiveToForm = {
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
  selectedChargeNumber,
  possibleConsecutivePunishments,
}: WhichPunishmentConsecutiveToForm): FormError | null {
  if (!selectedChargeNumber) return null

  const isValidSelection = possibleConsecutivePunishments.some(report => report.chargeNumber === selectedChargeNumber)
  if (!isValidSelection) return errors.CONSECUTIVE_LOOP

  return null
}
