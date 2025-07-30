import validateForm from './incidentRoleValidation'

describe('validateForm', () => {
  describe('Valid submit shows no errors', () => {
    it('returns the expected response for a valid submit', () => {
      expect(
        validateForm({
          incidentRole: 'attempted',
        }),
      ).toBeNull()
    })
  })
  describe('incidentRole and associated prisoner', () => {
    it('shows error if radio button not selected', () => {
      expect(validateForm({})).toEqual({
        href: '#currentRadioSelected',
        text: 'Select the prisoner’s role in this incident',
      })
    })
  })
})
