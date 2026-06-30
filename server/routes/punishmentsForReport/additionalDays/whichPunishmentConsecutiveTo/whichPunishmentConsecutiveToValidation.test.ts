import validateForm from './whichPunishmentConsecutiveToValidation'
import { PunishmentType, RehabilitativeActivity } from '../../../../data/PunishmentResult'
import { ConsecutiveAdditionalDaysReport } from '../../../../data/manageAdjudicationsUserTokensClient'

const buildReport = (chargeNumber: string, consecutiveChargeNumber?: string): ConsecutiveAdditionalDaysReport => ({
  chargeNumber,
  chargeProvedDate: '2023-07-18',
  punishment: {
    id: 1,
    type: PunishmentType.ADDITIONAL_DAYS,
    rehabilitativeActivities: [] as RehabilitativeActivity[],
    schedule: { duration: 5 },
    consecutiveChargeNumber,
  },
})

describe('whichPunishmentConsecutiveToValidation', () => {
  it('returns null when nothing is selected', () => {
    expect(validateForm({ selectedChargeNumber: null, possibleConsecutivePunishments: [] })).toBeNull()
  })

  it('returns null when the selected charge is present in the valid list', () => {
    expect(
      validateForm({
        selectedChargeNumber: '101',
        possibleConsecutivePunishments: [buildReport('101', '99')],
      }),
    ).toBeNull()
  })

  it('returns an error when the selected charge is not in the valid list (loop candidates are pre-filtered by the service)', () => {
    expect(
      validateForm({
        selectedChargeNumber: '101',
        possibleConsecutivePunishments: [],
      }),
    ).toEqual({
      href: '#consecutive-punishments-table',
      text: 'You cannot select this punishment because it is already consecutive to this charge',
    })
  })
})
