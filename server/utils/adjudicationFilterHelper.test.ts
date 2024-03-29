import { ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'
import { reportedAdjudicationStatuses } from './adjudicationFilterHelper'

describe('reportedAdjudicationStatuses', () => {
  it('should filter out adjudications with ACCEPTED status', () => {
    const expectedResult = [
      { value: ReportedAdjudicationStatus.AWAITING_REVIEW, text: 'Awaiting review', checked: false },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: false },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: false },
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: true },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: true },
      { value: ReportedAdjudicationStatus.ADJOURNED, text: 'Adjourned', checked: false },
      { value: ReportedAdjudicationStatus.NOT_PROCEED, text: 'Not proceeded with', checked: false },
      { value: ReportedAdjudicationStatus.DISMISSED, text: 'Dismissed', checked: false },
      { value: ReportedAdjudicationStatus.REFER_POLICE, text: 'Referred to police', checked: false },
      { value: ReportedAdjudicationStatus.PROSECUTION, text: 'Police prosecution', checked: false },
      { value: ReportedAdjudicationStatus.REFER_INAD, text: 'Referred to IA', checked: false },
      { value: ReportedAdjudicationStatus.REFER_GOV, text: 'Referred to Gov', checked: false },
      { value: ReportedAdjudicationStatus.CHARGE_PROVED, text: 'Charge proved', checked: false },
      { value: ReportedAdjudicationStatus.QUASHED, text: 'Quashed', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_OUTCOME, text: 'Invalid outcome', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_SUSPENDED, text: 'Invalid suspended', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_ADA, text: 'Invalid added days', checked: false },
    ]
    const filter = {
      fromDate: '22/11/2022',
      toDate: '24/11/2022',
      status: [
        ReportedAdjudicationStatus.SCHEDULED,
        ReportedAdjudicationStatus.UNSCHEDULED,
        ReportedAdjudicationStatus.ACCEPTED,
      ],
    }
    const result = reportedAdjudicationStatuses(filter)
    expect(result).toEqual(expectedResult)
  })
  it('should create the correct items when all statuses are passed in', () => {
    const expectedResult = [
      { value: ReportedAdjudicationStatus.AWAITING_REVIEW, text: 'Awaiting review', checked: true },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: true },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: true },
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: true },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: true },
      { value: ReportedAdjudicationStatus.ADJOURNED, text: 'Adjourned', checked: true },
      { value: ReportedAdjudicationStatus.NOT_PROCEED, text: 'Not proceeded with', checked: true },
      { value: ReportedAdjudicationStatus.DISMISSED, text: 'Dismissed', checked: true },
      { value: ReportedAdjudicationStatus.REFER_POLICE, text: 'Referred to police', checked: true },
      { value: ReportedAdjudicationStatus.PROSECUTION, text: 'Police prosecution', checked: true },
      { value: ReportedAdjudicationStatus.REFER_INAD, text: 'Referred to IA', checked: true },
      { value: ReportedAdjudicationStatus.REFER_GOV, text: 'Referred to Gov', checked: true },
      { value: ReportedAdjudicationStatus.CHARGE_PROVED, text: 'Charge proved', checked: true },
      { value: ReportedAdjudicationStatus.QUASHED, text: 'Quashed', checked: true },
      { value: ReportedAdjudicationStatus.INVALID_OUTCOME, text: 'Invalid outcome', checked: true },
      { value: ReportedAdjudicationStatus.INVALID_SUSPENDED, text: 'Invalid suspended', checked: true },
      { value: ReportedAdjudicationStatus.INVALID_ADA, text: 'Invalid added days', checked: true },
    ]
    const filter = {
      fromDate: '22/11/2022',
      toDate: '24/11/2022',
      status: [
        ReportedAdjudicationStatus.SCHEDULED,
        ReportedAdjudicationStatus.UNSCHEDULED,
        ReportedAdjudicationStatus.AWAITING_REVIEW,
        ReportedAdjudicationStatus.RETURNED,
        ReportedAdjudicationStatus.REJECTED,
        ReportedAdjudicationStatus.ADJOURNED,
        ReportedAdjudicationStatus.CHARGE_PROVED,
        ReportedAdjudicationStatus.DISMISSED,
        ReportedAdjudicationStatus.NOT_PROCEED,
        ReportedAdjudicationStatus.PROSECUTION,
        ReportedAdjudicationStatus.QUASHED,
        ReportedAdjudicationStatus.REFER_INAD,
        ReportedAdjudicationStatus.REFER_POLICE,
        ReportedAdjudicationStatus.REFER_GOV,
        ReportedAdjudicationStatus.INVALID_OUTCOME,
        ReportedAdjudicationStatus.INVALID_SUSPENDED,
        ReportedAdjudicationStatus.INVALID_ADA,
      ],
    }
    const result = reportedAdjudicationStatuses(filter)
    expect(result).toEqual(expectedResult)
  })
  it('should create the correct items when one filter is passed in - awaiting review', () => {
    const expectedResult = [
      { value: ReportedAdjudicationStatus.AWAITING_REVIEW, text: 'Awaiting review', checked: true },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: false },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: false },
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: false },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: false },
      { value: ReportedAdjudicationStatus.ADJOURNED, text: 'Adjourned', checked: false },
      { value: ReportedAdjudicationStatus.NOT_PROCEED, text: 'Not proceeded with', checked: false },
      { value: ReportedAdjudicationStatus.DISMISSED, text: 'Dismissed', checked: false },
      { value: ReportedAdjudicationStatus.REFER_POLICE, text: 'Referred to police', checked: false },
      { value: ReportedAdjudicationStatus.PROSECUTION, text: 'Police prosecution', checked: false },
      { value: ReportedAdjudicationStatus.REFER_INAD, text: 'Referred to IA', checked: false },
      { value: ReportedAdjudicationStatus.REFER_GOV, text: 'Referred to Gov', checked: false },
      { value: ReportedAdjudicationStatus.CHARGE_PROVED, text: 'Charge proved', checked: false },
      { value: ReportedAdjudicationStatus.QUASHED, text: 'Quashed', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_OUTCOME, text: 'Invalid outcome', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_SUSPENDED, text: 'Invalid suspended', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_ADA, text: 'Invalid added days', checked: false },
    ]
    const filter = {
      fromDate: '22/11/2022',
      toDate: '24/11/2022',
      status: ReportedAdjudicationStatus.AWAITING_REVIEW,
    }
    const result = reportedAdjudicationStatuses(filter)
    expect(result).toEqual(expectedResult)
  })
  it('should create the correct items when one filter is passed in - unscheduled (check for string simiarities wih scheduled)', () => {
    const expectedResult = [
      { value: ReportedAdjudicationStatus.AWAITING_REVIEW, text: 'Awaiting review', checked: false },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: false },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: false },
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: true },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: false },
      { value: ReportedAdjudicationStatus.ADJOURNED, text: 'Adjourned', checked: false },
      { value: ReportedAdjudicationStatus.NOT_PROCEED, text: 'Not proceeded with', checked: false },
      { value: ReportedAdjudicationStatus.DISMISSED, text: 'Dismissed', checked: false },
      { value: ReportedAdjudicationStatus.REFER_POLICE, text: 'Referred to police', checked: false },
      { value: ReportedAdjudicationStatus.PROSECUTION, text: 'Police prosecution', checked: false },
      { value: ReportedAdjudicationStatus.REFER_INAD, text: 'Referred to IA', checked: false },
      { value: ReportedAdjudicationStatus.REFER_GOV, text: 'Referred to Gov', checked: false },
      { value: ReportedAdjudicationStatus.CHARGE_PROVED, text: 'Charge proved', checked: false },
      { value: ReportedAdjudicationStatus.QUASHED, text: 'Quashed', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_OUTCOME, text: 'Invalid outcome', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_SUSPENDED, text: 'Invalid suspended', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_ADA, text: 'Invalid added days', checked: false },
    ]
    const filter = {
      fromDate: '22/11/2022',
      toDate: '24/11/2022',
      status: ReportedAdjudicationStatus.UNSCHEDULED,
    }
    const result = reportedAdjudicationStatuses(filter)
    expect(result).toEqual(expectedResult)
  })
  it('should create the correct items when multiple filters are passed in', () => {
    const expectedResult = [
      { value: ReportedAdjudicationStatus.AWAITING_REVIEW, text: 'Awaiting review', checked: false },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: true },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: true },
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: false },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: false },
      { value: ReportedAdjudicationStatus.ADJOURNED, text: 'Adjourned', checked: false },
      { value: ReportedAdjudicationStatus.NOT_PROCEED, text: 'Not proceeded with', checked: false },
      { value: ReportedAdjudicationStatus.DISMISSED, text: 'Dismissed', checked: false },
      { value: ReportedAdjudicationStatus.REFER_POLICE, text: 'Referred to police', checked: false },
      { value: ReportedAdjudicationStatus.PROSECUTION, text: 'Police prosecution', checked: false },
      { value: ReportedAdjudicationStatus.REFER_INAD, text: 'Referred to IA', checked: false },
      { value: ReportedAdjudicationStatus.REFER_GOV, text: 'Referred to Gov', checked: false },
      { value: ReportedAdjudicationStatus.CHARGE_PROVED, text: 'Charge proved', checked: false },
      { value: ReportedAdjudicationStatus.QUASHED, text: 'Quashed', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_OUTCOME, text: 'Invalid outcome', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_SUSPENDED, text: 'Invalid suspended', checked: false },
      { value: ReportedAdjudicationStatus.INVALID_ADA, text: 'Invalid added days', checked: false },
    ]
    const filter = {
      fromDate: '22/11/2022',
      toDate: '24/11/2022',
      status: [ReportedAdjudicationStatus.RETURNED, ReportedAdjudicationStatus.REJECTED],
    }
    const result = reportedAdjudicationStatuses(filter)
    expect(result).toEqual(expectedResult)
  })
})
