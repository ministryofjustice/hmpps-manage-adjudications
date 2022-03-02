import { IncidentRole as Role } from '../incidentRole/IncidentRole'
import { PlaceholderText as Text, PlaceholderValues } from './Placeholder'
import Title from './Title'

describe('title', () => {
  it('getProcessedText', () => {
    const testTokenReplacementDecisionTitle = new Title([
      [Role.COMMITTED, `Committed: ${Text.PRISONER_FULL_NAME}`],
      [Role.ATTEMPTED, `Attempted: ${Text.PRISONER_FULL_NAME}`],
      [Role.ASSISTED, `Assisted: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
      [Role.INCITED, `Incited: ${Text.PRISONER_FULL_NAME}. Associated: ${Text.ASSOCIATED_PRISONER_FULL_NAME}`],
    ])
    const placeholderValues: PlaceholderValues = {
      associatedPrisonerFirstName: 'ASSOCIATED_PRISONER_FIRST_NAME',
      associatedPrisonerLastName: 'ASSOCIATED_PRISONER_LAST_NAME',
      prisonerFirstName: 'PRISONER_FIRST_NAME',
      prisonerLastName: 'PRISONER_LAST_NAME',
      victimOtherPersonFullName: undefined,
      victimPrisonerFirstName: undefined,
      victimPrisonerLastName: undefined,
      victimStaffFullName: undefined,
    }
    // qqRP
    expect(testTokenReplacementDecisionTitle.getProcessedText(placeholderValues, Role.COMMITTED)).toEqual(
      'Committed: PRISONER_FIRST_NAME PRISONER_LAST_NAME'
    )
    expect(testTokenReplacementDecisionTitle.getProcessedText(placeholderValues, Role.ATTEMPTED)).toEqual(
      'Attempted: PRISONER_FIRST_NAME PRISONER_LAST_NAME'
    )
    expect(testTokenReplacementDecisionTitle.getProcessedText(placeholderValues, Role.ASSISTED)).toEqual(
      'Assisted: PRISONER_FIRST_NAME PRISONER_LAST_NAME. Associated: ASSOCIATED_PRISONER_FIRST_NAME ASSOCIATED_PRISONER_LAST_NAME'
    )
    expect(testTokenReplacementDecisionTitle.getProcessedText(placeholderValues, Role.INCITED)).toEqual(
      'Incited: PRISONER_FIRST_NAME PRISONER_LAST_NAME. Associated: ASSOCIATED_PRISONER_FIRST_NAME ASSOCIATED_PRISONER_LAST_NAME'
    )
  })
})
