import { Request } from 'express'
import moment from 'moment'
import { datePickerDateToMoment, momentDateToDatePicker } from '../../utils/utils'
import { FormError } from '../../@types/template'

enum ErrorType {
  FROM_DATE_AFTER_TO_DATE = 'FROM_DATE_AFTER_TO_DATE',
}

const error: { [key in ErrorType]: FormError } = {
  FROM_DATE_AFTER_TO_DATE: {
    href: '#fromDate[date]',
    text: 'Enter a date that is before or the same as the ‘date to’',
  },
}

export type ContinueReportUiFilter = {
  fromDate: string
  toDate: string
}

export type ContinueReportApiFilter = {
  fromDate: moment.Moment
  toDate: moment.Moment
}

export const uiFilterFromRequest = (req: Request): ContinueReportUiFilter => {
  return {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
  }
}

export const fillInDefaults = (uiFilter: ContinueReportUiFilter): ContinueReportUiFilter => {
  return {
    fromDate: uiFilter.fromDate || momentDateToDatePicker(moment().subtract(7, 'days')),
    toDate: uiFilter.toDate || momentDateToDatePicker(moment()),
  }
}

export const uiFilterFromBody = (req: Request) => {
  return {
    fromDate: req.body.fromDate.date,
    toDate: req.body.toDate.date,
  }
}

export const filterFromUiFilter = (filter: ContinueReportUiFilter) => {
  return {
    fromDate: datePickerDateToMoment(filter.fromDate),
    toDate: datePickerDateToMoment(filter.toDate),
  }
}

export const validate = (uiFilter: ContinueReportUiFilter): FormError[] => {
  if (datePickerDateToMoment(uiFilter.fromDate).isAfter(datePickerDateToMoment(uiFilter.toDate))) {
    return [error.FROM_DATE_AFTER_TO_DATE]
  }
  return []
}
