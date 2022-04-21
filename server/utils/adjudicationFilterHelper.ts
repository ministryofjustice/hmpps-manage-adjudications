import { Request } from 'express'
import moment from 'moment'
import { ReportedAdjudicationFilter, ReportedAdjudicationStatus } from '../data/ReportedAdjudicationResult'
import { datePickerDateToMoment, momentDateToDatePicker } from './utils'

export const reportedAdjudicationFilterFromRequestParameters = (req: Request) => {
  return {
    fromDate: (req.query.fromDate && datePickerDateToMoment(req.query.fromDate as string)) || moment(),
    toDate: (req.query.toDate && datePickerDateToMoment(req.query.toDate as string)) || moment(),
    status: (req.query.status as ReportedAdjudicationStatus) || null,
  }
}

export const uiFilterFromReportedAdjudicationFilter = (filter: ReportedAdjudicationFilter) => {
  return {
    fromDate: momentDateToDatePicker(filter.fromDate),
    toDate: momentDateToDatePicker(filter.toDate),
    status: filter.status,
  }
}
