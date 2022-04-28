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
    text: 'The from date cannot be after the to date',
  },
}

export type UiFilter = {
  fromDate: string
  toDate: string
  status: ReportedAdjudicationStatus
}

export const uiFilterFromRequest = (req: Request): UiFilter => {
  return {
    fromDate: (req.query.fromDate || momentDateToDatePicker(moment().subtract(2, 'days'))) as string,
    toDate: (req.query.toDate || momentDateToDatePicker(moment())) as string,
    status: req.query.status as ReportedAdjudicationStatus,
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
