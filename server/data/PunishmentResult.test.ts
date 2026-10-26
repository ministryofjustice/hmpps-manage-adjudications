import { flattenPunishment, PunishmentType } from './PunishmentResult'

describe('flattenPunishment', () => {
  it('keeps the payback notes, so saving the list again does not clear them', () => {
    const punishment = flattenPunishment({
      id: 1,
      type: PunishmentType.PAYBACK,
      schedule: { duration: 10, endDate: '2026-12-01' },
      paybackNotes: 'Clean the wing',
      rehabilitativeActivities: [],
    })
    expect(punishment.paybackNotes).toEqual('Clean the wing')
  })
})
