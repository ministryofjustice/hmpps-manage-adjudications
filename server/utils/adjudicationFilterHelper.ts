import { Request } from 'express'
import moment from 'moment'
import { ReportedAdjudicationFilter, ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'
import { datePickerDateToMoment, momentDateToDatePicker } from './utils'

export type UiFilter = {
  fromDate: string
  toDate: string
  status: ReportedAdjudicationStatus
}

export const uiFilterFromRequest = (req: Request): UiFilter => {
  return {
    fromDate: (req.query.fromDate || momentDateToDatePicker(moment())) as string,
    toDate: (req.query.toDate || momentDateToDatePicker(moment().subtract(1, 'days'))) as string,
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
