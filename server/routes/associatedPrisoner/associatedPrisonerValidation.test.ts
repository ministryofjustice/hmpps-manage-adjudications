import { AssociatedPrisonerLocation } from './associatedPrisonerUtils'
import validateForm from './associatedPrisonerValidation'

describe('validateForm', () => {
  describe('Valid submit shows no errors', () => {
    it('returns the expected response for a valid submit', () => {
      expect(
        validateForm({
          location: AssociatedPrisonerLocation.INTERNAL,
          associatedPrisonersNumber: 'GF456CU',
        })
      ).toBeNull()
    })
  })

  describe('Invalid submit shows errors', () => {
    it('returns expected error when nothing selected', () => {
      expect(
        validateForm({
          location: AssociatedPrisonerLocation.UNKNOWN,
        })
      ).toEqual([
        {
          href: '#selectedAnswerId',
          text: 'Select an option',
        },
      ])
    })
  })

  describe('Invalid internal submit shows errors', () => {
    it('returns expected error when number missing', () => {
      expect(
        validateForm({
          location: AssociatedPrisonerLocation.INTERNAL,
        })
      ).toEqual([
        {
          href: '#prisonerSearchNameInput',
          text: 'Enter the prisoner’s name or number',
        },
      ])
    })
  })

  describe('Invalid external submit shows errors', () => {
    it('returns expected error when name and number missing', () => {
      expect(
        validateForm({
          location: AssociatedPrisonerLocation.EXTERNAL,
        })
      ).toEqual([
        {
          href: '#prisonerOutsideEstablishmentNumberInput',
          text: 'Enter the prisoner’s number',
        },
        {
          href: '#prisonerOutsideEstablishmentNameInput',
          text: 'Enter the prisoner’s name',
        },
      ])
    })
    it('returns expected error when name missing', () => {
      expect(
        validateForm({
          location: AssociatedPrisonerLocation.EXTERNAL,
          associatedPrisonersNumber: '123',
        })
      ).toEqual([
        {
          href: '#prisonerOutsideEstablishmentNameInput',
          text: 'Enter the prisoner’s name',
        },
      ])
    })
    it('returns expected error when number missing', () => {
      expect(
        validateForm({
          location: AssociatedPrisonerLocation.EXTERNAL,
          associatedPrisonersName: '123',
        })
      ).toEqual([
        {
          href: '#prisonerOutsideEstablishmentNumberInput',
          text: 'Enter the prisoner’s number',
        },
      ])
    })
  })
})
