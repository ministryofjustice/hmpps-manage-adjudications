import validateForm, { ReviewStatus } from './prisonerReportReviewValidation'
import * as toTest from './prisonerReportReviewValidation'
import { wordLimitExceedingString } from '../../../utils/utils'

describe('validateForm - prisoner review', () => {
  describe('success', () => {
    it('success accept', () => {
      expect(validateForm({ status: ReviewStatus.UNSCHEDULED, reason: '', details: '' })).toBeNull()
    })
    it('success unscheduled', () => {
      expect(validateForm({ status: ReviewStatus.UNSCHEDULED, reason: '', details: '' })).toBeNull()
    })
    it('success reject', () => {
      expect(validateForm({ status: ReviewStatus.REJECTED, reason: 'reason', details: 'details' })).toBeNull()
    })
    it('success returned', () => {
      expect(validateForm({ status: ReviewStatus.RETURNED, reason: 'reason', details: 'details' })).toBeNull()
    })
  })
  describe('status', () => {
    it('missing status', () => {
      expect(validateForm({ status: null, reason: '', details: '' })).toStrictEqual([toTest.errors.MISSING_STATUS])
    })
  })
  describe('reason', () => {
    it('missing rejected reason', () => {
      expect(validateForm({ status: ReviewStatus.REJECTED, reason: '', details: '' })).toStrictEqual([
        toTest.errors.MISSING_REJECT_REASON,
        toTest.errors.MISSING_REJECT_DETAILS,
      ])
    })
    it('missing returned reason', () => {
      expect(validateForm({ status: ReviewStatus.RETURNED, reason: '', details: '' })).toStrictEqual([
        toTest.errors.MISSING_RETURN_REASON,
        toTest.errors.MISSING_RETURN_DETAILS,
      ])
    })
  })
  describe('details', () => {
    it('missing rejected details', () => {
      expect(validateForm({ status: ReviewStatus.REJECTED, reason: 'reason', details: '' })).toStrictEqual([
        toTest.errors.MISSING_REJECT_DETAILS,
      ])
    })
    it('missing returned details', () => {
      expect(validateForm({ status: ReviewStatus.RETURNED, reason: 'reason', details: '' })).toStrictEqual([
        toTest.errors.MISSING_RETURN_DETAILS,
      ])
    })
    it('rejected details too large', () => {
      expect(
        validateForm({ status: ReviewStatus.REJECTED, reason: 'reason', details: wordLimitExceedingString })
      ).toStrictEqual([toTest.errors.REJECT_DETAILS_WORD_COUNT_EXCEEDED])
    })
    it('returned details too large', () => {
      expect(
        validateForm({ status: ReviewStatus.RETURNED, reason: 'reason', details: wordLimitExceedingString })
      ).toStrictEqual([toTest.errors.RETURN_DETAILS_WORD_COUNT_EXCEEDED])
    })
    it('accepted details too large', () => {
      expect(validateForm({ status: ReviewStatus.ACCEPTED, details: wordLimitExceedingString })).toStrictEqual([
        toTest.errors.ACCEPTED_DETAILS_WORD_COUNT_EXCEEDED,
      ])
    })
  })
})
