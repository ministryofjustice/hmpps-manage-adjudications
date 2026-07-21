import { NotCompletedOutcome } from '../../../../data/PunishmentResult'
import validateForm from './incompleteRehabilitativeActivityValidation'

describe('incomplete rehab activity validation', () => {
  it('not errors if all data is correct', () => {
    expect(
      validateForm({
        outcome: NotCompletedOutcome.EXT_SUSPEND,
        daysToActivate: 4,
        suspendedUntil: '15/06/2024',
        prisonerName: 'John Smith',
        actualDays: 5,
      }),
    ).toBeNull()
  })
  it('errors if no outcome is selected', () => {
    expect(
      validateForm({
        outcome: null,
        daysToActivate: 4,
        suspendedUntil: '15/06/2024',
        prisonerName: 'John Smith',
        actualDays: 5,
      }),
    ).toEqual({
      href: '#outcome',
      text: 'Select what happens to John Smith’s suspended punishment',
    })
  })
  it('errors if partial is chosen but no new number of days', () => {
    expect(
      validateForm({
        outcome: NotCompletedOutcome.PARTIAL_ACTIVATE,
        daysToActivate: null,
        suspendedUntil: '15/06/2024',
        prisonerName: 'John Smith',
        actualDays: 5,
      }),
    ).toEqual({
      href: '#daysToActivate',
      text: `Enter the number of days for the punishment`,
    })
  })
  it('errors if partial is chosen but something other than a number is entered', () => {
    expect(
      validateForm({
        outcome: NotCompletedOutcome.PARTIAL_ACTIVATE,
        // @ts-expect-error: Test with string
        daysToActivate: 'beep',
        suspendedUntil: '15/06/2024',
        prisonerName: 'John Smith',
        actualDays: 5,
      }),
    ).toEqual({
      href: '#daysToActivate',
      text: `The number of days for the punishment must be a number`,
    })
  })
  it('Partial chosen and number entered but it is a string type', () => {
    expect(
      validateForm({
        outcome: NotCompletedOutcome.PARTIAL_ACTIVATE,
        // @ts-expect-error: Test with string
        daysToActivate: '3',
        suspendedUntil: '15/06/2024',
        prisonerName: 'John Smith',
        actualDays: 5,
      }),
    ).toBeNull()
  })
  it('Partial chosen but number entered is more than previously chosen for the punishment', () => {
    expect(
      validateForm({
        outcome: NotCompletedOutcome.PARTIAL_ACTIVATE,
        daysToActivate: 6,
        suspendedUntil: '15/06/2024',
        prisonerName: 'John Smith',
        actualDays: 5,
      }),
    ).toEqual({
      href: '#daysToActivate',
      text: `The number of days for the punishment must be 5 or fewer`,
    })
  })
  it('Extended chosen but no date entered', () => {
    expect(
      validateForm({
        outcome: NotCompletedOutcome.EXT_SUSPEND,
        daysToActivate: null,
        suspendedUntil: null,
        prisonerName: 'John Smith',
        actualDays: 5,
      }),
    ).toEqual({
      href: '#suspendedUntil',
      text: `Enter the new date the suspended punishment will end`,
    })
  })
  it('Extended chosen but date incorrectly entered', () => {
    expect(
      validateForm({
        outcome: NotCompletedOutcome.EXT_SUSPEND,
        daysToActivate: null,
        suspendedUntil: '2025/01/04',
        prisonerName: 'John Smith',
        actualDays: 5,
      }),
    ).toEqual({
      href: '#suspendedUntil',
      text: `The new date the suspended punishment will end must be a real date`,
    })
  })
})
