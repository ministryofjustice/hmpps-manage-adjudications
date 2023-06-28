import validateForm from './incidentStatementValidation'
import { wordLimitExceedingString } from '../../utils/utils'

describe('validateForm - incident statement', () => {
  describe('Missing statement', () => {
    it('returns the expected response for a valid submit', () => {
      expect(validateForm({ incidentStatementComplete: 'yes', incidentStatement: 'Lorem ipsum' })).toBeNull()
    })

    it('returns the expected response for an invalid submit', () => {
      expect(validateForm({ incidentStatementComplete: 'yes', incidentStatement: '' })).toStrictEqual({
        href: '#incidentStatement',
        text: 'Enter the details of the incident',
      })
    })
  })
  describe('Character count exceeded', () => {
    it('returns the expected response for a valid submit', () => {
      expect(
        validateForm({
          incidentStatementComplete: 'yes',
          incidentStatement: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        })
      ).toBeNull()
    })
    it('returns the expected response for an invalid submit', () => {
      expect(
        validateForm({ incidentStatementComplete: 'yes', incidentStatement: wordLimitExceedingString })
      ).toStrictEqual({
        href: '#incidentStatement',
        text: 'Your statement must be 4,000 characters or fewer',
      })
    })
    it('returns the expected response for an invalid submit', () => {
      expect(
        validateForm({ incidentStatementComplete: 'no', incidentStatement: wordLimitExceedingString })
      ).toStrictEqual({
        href: '#incidentStatement',
        text: 'Your statement must be 4,000 characters or fewer',
      })
    })
  })
  describe('Radio button option not selected', () => {
    it('returns the expected response for a valid submit with draft', () => {
      expect(
        validateForm({
          incidentStatementComplete: 'no',
          incidentStatement: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        })
      ).toBeNull()
    })
    it('returns the expected response for a valid submit with complete statement', () => {
      expect(
        validateForm({
          incidentStatementComplete: 'yes',
          incidentStatement: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        })
      ).toBeNull()
    })
    it('returns the expected response for an invalid submit with statement', () => {
      expect(validateForm({ incidentStatement: 'Lorem Ipsum' })).toStrictEqual({
        href: '#incidentStatementComplete',
        text: 'Select yes if you’ve completed your statement',
      })
    })
    it('returns the expected response for an invalid submit with no statement', () => {
      expect(validateForm({ incidentStatement: '' })).toStrictEqual({
        href: '#incidentStatementComplete',
        text: 'Select yes if you’ve completed your statement',
      })
    })
  })
})
