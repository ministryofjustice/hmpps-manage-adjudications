import { Request } from 'express'
import moment from 'moment'
import {
  allIssueStatuses,
  allStatuses,
  IssueStatus,
  ReportedAdjudicationStatus,
  reportedAdjudicationStatusDisplayName,
} from '../data/ReportedAdjudicationResult'
import { datePickerDateToMoment, datePickerToApi, momentDateToDatePicker } from './utils'
import { FormError } from '../@types/template'

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
  status: ReportedAdjudicationStatus | ReportedAdjudicationStatus[]
  transfersOnly?: boolean
}

export type TransfersUiFilter = {
  status: ReportedAdjudicationStatus | ReportedAdjudicationStatus[]
  transfersOnly?: boolean
}

export type DISUiFilter = {
  fromDate: string
  toDate: string
  locationId: string
}

export interface PrintDISFormsUiFilter extends DISUiFilter {
  issueStatus: IssueStatus | IssueStatus[]
}

export type AdjudicationHistoryUiFilter = {
  fromDate?: string
  toDate?: string
  status: ReportedAdjudicationStatus | ReportedAdjudicationStatus[]
  agency?: string | string[]
}

export const uiDISFormFilterFromRequest = (req: Request): DISUiFilter => {
  return {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    locationId: req.query.locationId as string,
  }
}

export const uiPrintDISFormFilterFromRequest = (req: Request): PrintDISFormsUiFilter => {
  return {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    locationId: req.query.locationId as string,
    issueStatus: req.query.issueStatus as IssueStatus,
  }
}

export const uiFilterFromRequest = (req: Request): UiFilter => {
  return {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    status: req.query.status as ReportedAdjudicationStatus,
    transfersOnly: req.query.transfersOnly as unknown as boolean,
  }
}

export const uiTransfersFilterFromRequest = (req: Request): TransfersUiFilter => {
  return {
    status: req.query.status as ReportedAdjudicationStatus,
    transfersOnly: req.query.transfersOnly as unknown as boolean,
  }
}

export const uiAdjudicationHistoryFilterFromRequest = (req: Request): AdjudicationHistoryUiFilter => {
  return {
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    status: req.query.status as ReportedAdjudicationStatus,
    agency: req.query.agency as string,
  }
}

export type AwardedPunishmentsAndDamagesFilter = {
  hearingDate: string
  locationId: string | number
}

export type AwardedPunishmentsAndDamagesUiFilter = {
  hearingDate: string
  locationId: string
}

export const fillInAwardedPunishmentsAndDamagesFilterDefaults = (
  awardedPunishmentsAndDamagesUiFilter: AwardedPunishmentsAndDamagesUiFilter
): AwardedPunishmentsAndDamagesUiFilter => {
  return {
    hearingDate: awardedPunishmentsAndDamagesUiFilter.hearingDate || momentDateToDatePicker(moment()),
    locationId: awardedPunishmentsAndDamagesUiFilter.locationId || null,
  }
}

export const uiAwardedPunishmentsAndDamagesFilterFromBody = (req: Request): AwardedPunishmentsAndDamagesUiFilter => {
  return {
    hearingDate: req.body.hearingDate.date as string,
    locationId: req.body.locationId as string,
  }
}

export const uiAwardedPunishmentsAndDamagesFilterFromRequest = (req: Request): AwardedPunishmentsAndDamagesUiFilter => {
  return {
    hearingDate: req.query.hearingDate as string,
    locationId: req.query.locationId as string,
  }
}

export const awardedPunishmentsAndDamagesFilterFromUiFilter = (
  filter: AwardedPunishmentsAndDamagesUiFilter
): AwardedPunishmentsAndDamagesFilter => {
  return {
    hearingDate: datePickerToApi(filter.hearingDate),
    locationId: (filter.locationId && Number(filter.locationId)) || null,
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
    status: uiFilter.status || allStatuses,
    transfersOnly: uiFilter.transfersOnly,
  }
}

// Same as fillInDefaults r.e. dates
// LocationId defaults to null, api interprets as all locations
export const fillInDISFormFilterDefaults = (DISUiFilter: DISUiFilter): DISUiFilter => {
  return {
    fromDate: DISUiFilter.fromDate || momentDateToDatePicker(moment().subtract(2, 'days')),
    toDate: DISUiFilter.toDate || momentDateToDatePicker(moment()),
    locationId: DISUiFilter.locationId || null,
  }
}

export const fillInTransfersDefaults = (uiFilter: TransfersUiFilter): TransfersUiFilter => {
  return {
    status: uiFilter.status || transferredStatuses,
  }
}

// Same as fillInDefaults r.e. dates
export const fillInPrintDISFormFilterDefaults = (
  printDISFormsUiFilter: PrintDISFormsUiFilter
): PrintDISFormsUiFilter => {
  return {
    fromDate: printDISFormsUiFilter.fromDate || momentDateToDatePicker(moment()),
    toDate: printDISFormsUiFilter.toDate || momentDateToDatePicker(moment().add(2, 'days')),
    locationId: printDISFormsUiFilter.locationId || null,
    issueStatus: printDISFormsUiFilter.issueStatus || allIssueStatuses,
  }
}

export const fillInAdjudicationHistoryDefaults = (
  uiFilter: AdjudicationHistoryUiFilter
): AdjudicationHistoryUiFilter => {
  return {
    status: uiFilter.status || allStatuses,
  }
}

export const uiFilterFromBody = (req: Request) => {
  return {
    fromDate: req.body.fromDate.date,
    toDate: req.body.toDate.date,
    status: req.body.status as ReportedAdjudicationStatus,
  }
}

export const transfersUiFilterFromBody = (req: Request) => {
  return {
    status: req.body.status as ReportedAdjudicationStatus,
  }
}

export const DISFormUiFilterFromBody = (req: Request) => {
  return {
    fromDate: req.body.fromDate.date,
    toDate: req.body.toDate.date,
    locationId: req.body.locationId,
  }
}

export const PrintDISFormUiFilterFromBody = (req: Request) => {
  return {
    fromDate: req.body.fromDate.date,
    toDate: req.body.toDate.date,
    locationId: req.body.locationId,
    issueStatus: req.body.issueStatus,
  }
}

export const adjudicationHistoryUiFilterFromBody = (req: Request) => {
  return {
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
    status: req.body.status as ReportedAdjudicationStatus,
    agency: req.body.agency as string,
  }
}

export const filterFromUiFilter = (filter: UiFilter) => {
  return {
    fromDate: datePickerDateToMoment(filter.fromDate),
    toDate: datePickerDateToMoment(filter.toDate),
    status: filter.status || allStatuses,
  }
}

export const DISFormfilterFromUiFilter = (filter: DISUiFilter) => {
  return {
    fromDate: datePickerDateToMoment(filter.fromDate),
    toDate: datePickerDateToMoment(filter.toDate),
    locationId: (filter.locationId && Number(filter.locationId)) || null,
  }
}

export const transfersFilterFromUiFilter = (filter: TransfersUiFilter) => {
  return {
    fromDate: datePickerDateToMoment('01/01/2001'),
    status: filter.status || transferredStatuses,
    transfersOnly: true,
  }
}

export const adjudicationHistoryFilterFromUiFilter = (filter: AdjudicationHistoryUiFilter) => {
  return {
    fromDate: filter.fromDate && datePickerDateToMoment(filter.fromDate),
    toDate: filter.toDate && datePickerDateToMoment(filter.toDate),
    status: filter.status || allStatuses,
    agency: filter.agency,
  }
}

export const printDISFormfilterFromUiFilter = (filter: PrintDISFormsUiFilter) => {
  return {
    fromDate: datePickerDateToMoment(filter.fromDate),
    toDate: datePickerDateToMoment(filter.toDate),
    locationId: (filter.locationId && Number(filter.locationId)) || null,
    issueStatus: filter.issueStatus || allIssueStatuses,
  }
}

export const validate = (uiFilter: UiFilter | DISUiFilter): FormError[] => {
  if (datePickerDateToMoment(uiFilter.fromDate).isAfter(datePickerDateToMoment(uiFilter.toDate))) {
    return [error.FROM_DATE_AFTER_TO_DATE]
  }
  return []
}

const itemCheckBoxMatch = (selectedItems: any, checkbox: any) => {
  if (!Array.isArray(selectedItems)) return selectedItems === checkbox
  return selectedItems.includes(checkbox)
}

export const reportedAdjudicationStatuses = (filter: UiFilter | AdjudicationHistoryUiFilter) => {
  const statuses = Object.keys(ReportedAdjudicationStatus)

  const filteredStatuses = statuses.filter(key => key !== ReportedAdjudicationStatus.ACCEPTED)

  return filteredStatuses.map(key => {
    return {
      value: key,
      text: reportedAdjudicationStatusDisplayName(key as ReportedAdjudicationStatus),
      checked: itemCheckBoxMatch(filter.status, key as ReportedAdjudicationStatus),
    }
  })
}

export const establishmentCheckboxes = (filter: AdjudicationHistoryUiFilter, establishments: string[]) => {
  return establishments.map(key => {
    return {
      value: key,
      text: key,
      checked: itemCheckBoxMatch(filter.agency, key),
    }
  })
}

export const transferredStatuses = [
  ReportedAdjudicationStatus.UNSCHEDULED,
  ReportedAdjudicationStatus.REFER_INAD,
  ReportedAdjudicationStatus.REFER_POLICE,
  ReportedAdjudicationStatus.ADJOURNED,
]

export const transferredAdjudicationStatuses = (filter: TransfersUiFilter) => {
  return transferredStatuses.map(key => {
    return {
      value: key,
      text: reportedAdjudicationStatusDisplayName(key as ReportedAdjudicationStatus),
      checked: itemCheckBoxMatch(filter.status, key as ReportedAdjudicationStatus),
    }
  })
}
