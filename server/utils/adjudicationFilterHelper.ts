import { Request } from 'express'
import moment from 'moment'
import { ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'
import { datePickerDateToMoment, momentDateToDatePicker } from './utils'
import { FormError } from '../@types/template'

// eslint-disable-next-line no-shadow
enum ErrorType {
  FROM_DATE_AFTER_TO_DATE = 'FROM_DATE_AFTER_TO_DATE',
}

const error: { [key in ErrorType]: FormError } = {
  FROM_DATE_AFTER_TO_DATE: {
    href: '#fromDate[date]',
    text: 'Enter a date that is before or the same as the ‘date to’',
  },
}

export type UiFilter = {
  fromDate: string
  toDate: string
  status: ReportedAdjudicationStatus
}

export const uiFilterFromRequest = (req: Request): UiFilter => {
  return {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    status: req.query.status as ReportedAdjudicationStatus,
  }
}

// When no 'to' date is provided we use today. When no 'from' date is provided we use 2 days ago. This should provide a
// default time window that covers at a minimum the last 48hrs. For reference if the 'to' and 'from' date are today we
// get results for all of today, thus if set the 'to' date 2 days ago we should also get the proceeding 2 days.
// The status default to null, which the api interprets as all statuses.
export const fillInDefaults = (uiFilter: UiFilter): UiFilter => {
  return {
    fromDate: uiFilter.fromDate || momentDateToDatePicker(moment().subtract(2, 'days')),
    toDate: uiFilter.toDate || momentDateToDatePicker(moment()),
    status: uiFilter.status,
  }
}

export const uiFilterFromBody = (req: Request) => {
  return {
    fromDate: req.body.fromDate.date,
    toDate: req.body.toDate.date,
    status: req.body.status as ReportedAdjudicationStatus,
  }
}

export const filterFromUiFilter = (filter: UiFilter) => {
  return {
    fromDate: datePickerDateToMoment(filter.fromDate),
    toDate: datePickerDateToMoment(filter.toDate),
    status: filter.status,
  }
}

export const validate = (uiFilter: UiFilter): FormError[] => {
  if (datePickerDateToMoment(uiFilter.fromDate).isAfter(datePickerDateToMoment(uiFilter.toDate))) {
    return [error.FROM_DATE_AFTER_TO_DATE]
  }
  return []
}
