import validateForm from './incidentRoleValidation'

describe('validateForm', () => {
  describe('Valid submit shows no errors', () => {
    it('returns the expected response for a valid submit', () => {
      expect(
        validateForm({
          incidentRole: 'attempted',
          associatedPrisonersNumber: 'GF456CU',
        })
      ).toBeNull()
    })
  })
  describe('incidentRole and associated prisoner', () => {
    it('shows error if radio button not selected', () => {
      expect(
        validateForm({
          associatedPrisonersNumber: null,
        })
      ).toEqual({
        href: '#currentRadioSelected',
        text: 'Select the prisoner’s role in this incident',
      })
    })
    it('shows error if no associated prisoner is selected when there should be', () => {
      expect(
        validateForm({
          incidentRole: 'incited',
          associatedPrisonersNumber: null,
        })
      ).toEqual({
        href: '#incitedInput',
        text: 'Enter the prisoner’s name or number',
      })
      expect(
        validateForm({
          incidentRole: 'assisted',
          associatedPrisonersNumber: null,
        })
      ).toEqual({
        href: '#assistedInput',
        text: 'Enter the prisoner’s name or number',
      })
    })
    it('shows no error there does not need to be an associated prisoner', () => {
      expect(
        validateForm({
          incidentRole: 'committed',
          associatedPrisonersNumber: null,
        })
      ).toBeNull()
      expect(
        validateForm({
          incidentRole: 'attempted',
          associatedPrisonersNumber: null,
        })
      ).toBeNull()
    })
  })
})
