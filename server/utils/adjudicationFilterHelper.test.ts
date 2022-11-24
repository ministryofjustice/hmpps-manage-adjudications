import { ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'
import { reportedAdjudicationStatuses } from './adjudicationFilterHelper'

describe('reportedAdjudicationStatuses', () => {
  it('should filter out adjudications with ACCEPTED status', () => {
    const expectedResult = [
      { value: ReportedAdjudicationStatus.AWAITING_REVIEW, text: 'Awaiting review', checked: false },
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: true },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: false },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: true },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: false },
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
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: true },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: true },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: true },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: true },
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
      ],
    }
    const result = reportedAdjudicationStatuses(filter)
    expect(result).toEqual(expectedResult)
  })
  it('should create the correct items when one filter is passed in - awaiting review', () => {
    const expectedResult = [
      { value: ReportedAdjudicationStatus.AWAITING_REVIEW, text: 'Awaiting review', checked: true },
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: false },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: false },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: false },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: false },
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
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: true },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: false },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: false },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: false },
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
      { value: ReportedAdjudicationStatus.UNSCHEDULED, text: 'Unscheduled', checked: false },
      { value: ReportedAdjudicationStatus.RETURNED, text: 'Returned', checked: true },
      { value: ReportedAdjudicationStatus.SCHEDULED, text: 'Scheduled', checked: false },
      { value: ReportedAdjudicationStatus.REJECTED, text: 'Rejected', checked: true },
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
