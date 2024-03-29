import validateForm from './addEvidenceValidation'
import { wordLimitExceedingString } from '../../utils/utils'

describe('ValidateForm', () => {
  it('returns null if there are no errors', () => {
    const result = validateForm({
      evidenceDescription: 'some description',
      evidenceType: 'photo',
      bwcIdentifier: undefined,
      batIdentifier: undefined,
    })
    expect(result).toBe(null)
  })
  it('returns correct error if the evidence type is missing', () => {
    const result = validateForm({
      evidenceDescription: 'some description',
      evidenceType: undefined,
      bwcIdentifier: undefined,
      batIdentifier: undefined,
    })
    expect(result).toStrictEqual({
      href: '#evidenceType',
      text: 'Select the type of evidence',
    })
  })
  it('returns correct error if the evidence description is missing', () => {
    const result = validateForm({
      evidenceDescription: undefined,
      evidenceType: 'CCTV',
      bwcIdentifier: undefined,
      batIdentifier: undefined,
    })
    expect(result).toStrictEqual({
      href: '#evidenceDescription',
      text: 'Enter details about this evidence',
    })
  })
  it('returns correct error if body-worn camera is selected but the camera number not entered', () => {
    const result = validateForm({
      evidenceDescription: 'Video showing prisoner assaulting victim',
      evidenceType: 'BODY_WORN_CAMERA',
      bwcIdentifier: undefined,
      batIdentifier: undefined,
    })
    expect(result).toStrictEqual({
      href: '#bwcIdentifier',
      text: 'Enter the camera number',
    })
  })
  it('returns correct error if body-worn camera is selected but the camera number is more than 15 characters', () => {
    const result = validateForm({
      evidenceDescription: 'Video showing prisoner assaulting victim',
      evidenceType: 'BODY_WORN_CAMERA',
      bwcIdentifier: 'abcdefghijklmnop',
      batIdentifier: undefined,
    })
    expect(result).toStrictEqual({
      href: '#bwcIdentifier',
      text: 'Camera number must be 15 characters or less',
    })
  })
  it('returns correct error if bagged and tagged evidence is selected but the seal number is not entered', () => {
    const result = validateForm({
      evidenceDescription: 'Table leg used to assault victim',
      evidenceType: 'BAGGED_AND_TAGGED',
      bwcIdentifier: undefined,
      batIdentifier: undefined,
    })
    expect(result).toStrictEqual({
      href: '#batIdentifier',
      text: 'Enter the seal number',
    })
  })
  it('returns correct error if bagged and tagged evidence is selected and seal number is more than 32 characters', () => {
    const result = validateForm({
      evidenceDescription: 'Table leg used to assault victim',
      evidenceType: 'BAGGED_AND_TAGGED',
      bwcIdentifier: undefined,
      batIdentifier: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
    })
    expect(result).toStrictEqual({
      href: '#batIdentifier',
      text: 'Seal number must be 32 characters or less',
    })
  })
  it('returns the expected response for an invalid submit', () => {
    expect(
      validateForm({
        evidenceDescription: wordLimitExceedingString,
        evidenceType: 'photo',
        bwcIdentifier: undefined,
        batIdentifier: undefined,
      })
    ).toStrictEqual({
      href: '#evidenceDescription',
      text: 'Your statement must be 4,000 characters or less',
    })
  })
})
