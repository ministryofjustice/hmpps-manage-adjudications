import { getProcessedText, PlaceholderText } from './Placeholder'

describe('process text', () => {
  it('all placeholder text', () => {
    const template = Object.values(PlaceholderText).join('') // make a template out of all the PlaceholderText types
    // Casing representative of what we get back from the API
    const placeholderValues = {
      associatedPrisonerFirstName: 'ASSOCIATEDPRISONERFIRSTNAME',
      associatedPrisonerLastName: 'ASSOCIATEDPRISONERLASTNAME',
      prisonerFirstName: 'PRISONERFIRSTNAME',
      prisonerLastName: 'PRISONERLASTNAME',
      victimOtherPersonFullName: 'VICTIMOTHERPERSONFIRSTNAME VICTIMOTHERPERSONLASTNAME', // User input
      victimPrisonerFirstName: 'VICTIMPRISONERFIRSTNAME',
      victimPrisonerLastName: 'VICTIMPRISONERLASTNAME',
      victimStaffFullName: 'VICTIMSTAFFFIRSTNAME VICTIMSTAFFLASTNAME', // Single field from the API
    }
    // Check the template is as we expect it.
    expect(template).toEqual(
      '{PRISONER_FULL_NAME}' +
        '{PRISONER_FULL_NAME_POSSESSIVE}' +
        '{ASSOCIATED_PRISONER_FULL_NAME}' +
        '{VICTIM_STAFF_FULL_NAME}' +
        '{VICTIM_PRISONER_FULL_NAME}' +
        '{VICTIM_OTHER_PERSON_FULL_NAME}'
    )
    // Now test that processing works as expected.
    expect(getProcessedText(template, placeholderValues)).toEqual(
      'Prisonerfirstname Prisonerlastname' +
        'Prisonerfirstname Prisonerlastname’s' +
        'Associatedprisonerfirstname Associatedprisonerlastname' +
        'Victimstafffirstname Victimstafflastname' +
        'Victimprisonerfirstname Victimprisonerlastname' +
        'Victimotherpersonfirstname Victimotherpersonlastname'
    )
  })
  it('possessive ends in s', () => {
    const template = PlaceholderText.PRISONER_FULL_NAME_POSSESSIVE
    const placeholderValuesEndsInS = {
      prisonerFirstName: 'PRISONERFIRSTNAME',
      prisonerLastName: 'PRISONERLASTNAMES',
    }
    expect(getProcessedText(template, placeholderValuesEndsInS)).toEqual('Prisonerfirstname Prisonerlastnames’')
  })
  it('nulls resolve to empty', () => {
    const template = Object.values(PlaceholderText).join('') // make a template out of all the PlaceholderText types
    const placeholderValuesMinimal = {
      prisonerFirstName: 'PRISONERFIRSTNAME',
      prisonerLastName: 'PRISONERLASTNAME',
    }
    expect(getProcessedText(template, placeholderValuesMinimal)).toEqual(
      'Prisonerfirstname PrisonerlastnamePrisonerfirstname Prisonerlastname’s'
    )
  })
})
