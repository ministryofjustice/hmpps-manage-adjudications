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
import { EstablishmentInformation, FormError } from '../@types/template'
import {
  AdjudicationHistoryBookingType,
  AdjudicationHistoryPunishmentTypeFilter,
} from '../data/AdjudicationHistoryData'

enum ErrorType {
  FROM_DATE_AFTER_TO_DATE = 'FROM_DATE_AFTER_TO_DATE',
}

const error: { [key in ErrorType]: FormError } = {
  FROM_DATE_AFTER_TO_DATE: {
    href: '#fromDate[date]',
    text: 'Enter a date that is before or the same as the ‘date to’',
  },
}

export type TransferredAdjudicationFilter = {
  status: ReportedAdjudicationStatus | ReportedAdjudicationStatus[]
  type: TransferredReportType
}

export type UiFilter = {
  fromDate: string
  toDate: string
  status: ReportedAdjudicationStatus | ReportedAdjudicationStatus[]
}

export type TransfersUiFilter = {
  status: ReportedAdjudicationStatus | ReportedAdjudicationStatus[]
  type?: TransferredReportType
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
  bookingType: AdjudicationHistoryBookingType
  fromDate?: string
  toDate?: string
  status?: ReportedAdjudicationStatus | ReportedAdjudicationStatus[]
  agency?: string | string[]
  punishment?: AdjudicationHistoryPunishmentTypeFilter | AdjudicationHistoryPunishmentTypeFilter[]
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
  }
}

export const uiTransfersFilterFromRequest = (req: Request): TransfersUiFilter => {
  const type = req.query.type ? req.query.type : getTransferTypeFromPath(req)
  return {
    status: req.query.status as ReportedAdjudicationStatus,
    type: type as TransferredReportType,
  }
}

const getTransferTypeFromPath = (req: Request) => {
  const { path } = req.route
  if (path === '/in') return TransferredReportType.IN
  if (path === '/out') return TransferredReportType.OUT
  return TransferredReportType.ALL
}

export const uiAdjudicationHistoryFilterFromRequest = (req: Request): AdjudicationHistoryUiFilter => {
  return {
    bookingType: req.query.bookingType as AdjudicationHistoryBookingType,
    fromDate: req.query.fromDate as string,
    toDate: req.query.toDate as string,
    status: req.query.status as ReportedAdjudicationStatus,
    agency: req.query.agency as string,
    punishment: req.query.punishment as AdjudicationHistoryPunishmentTypeFilter,
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
    status: uiFilter.status,
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
  const availableStatuses = getAvailableStatuses(uiFilter.type)
  return {
    status: uiFilter.status || availableStatuses,
    type: uiFilter.type,
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
    ...uiFilter,
    bookingType: uiFilter.bookingType || AdjudicationHistoryBookingType.CURRENT,
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
    bookingType: req.body.bookingType,
    fromDate: req.body.fromDate,
    toDate: req.body.toDate,
    status: req.body.status as ReportedAdjudicationStatus,
    agency: req.body.agency as string,
    punishment: req.body.punishment as AdjudicationHistoryPunishmentTypeFilter,
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

export const transfersFilterFromUiFilter = (filter: TransfersUiFilter, transferType: TransferredReportType) => {
  return {
    status: filter.status || transferredInStatuses,
    type: transferType,
  }
}

export const adjudicationHistoryFilterFromUiFilter = (filter: AdjudicationHistoryUiFilter) => {
  return {
    bookingType: filter.bookingType || AdjudicationHistoryBookingType.CURRENT,
    fromDate: filter.fromDate && datePickerDateToMoment(filter.fromDate),
    toDate: filter.toDate && datePickerDateToMoment(filter.toDate),
    status: filter.status || allStatuses,
    agency: filter.agency,
    ada: filter.punishment?.includes(AdjudicationHistoryPunishmentTypeFilter.ADDITIONAL_DAYS) || false,
    pada: filter.punishment?.includes(AdjudicationHistoryPunishmentTypeFilter.PROSPECTIVE_DAYS) || false,
    suspended: filter.punishment?.includes(AdjudicationHistoryPunishmentTypeFilter.SUSPENDED) || false,
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

const itemCheckBoxMatch = (selectedItems: Array<unknown> | string, checkbox: string) => {
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

export const establishmentCheckboxes = (
  filter: AdjudicationHistoryUiFilter,
  establishments: EstablishmentInformation[]
) => {
  return establishments.map(agencyInfo => {
    return {
      value: agencyInfo.agency,
      text: agencyInfo.agencyDescription,
      checked: itemCheckBoxMatch(filter.agency, agencyInfo.agency),
    }
  })
}

export const punishmentCheckboxes = (filter: AdjudicationHistoryUiFilter) => {
  const chosenPunishments = [
    {
      type: AdjudicationHistoryPunishmentTypeFilter.ADDITIONAL_DAYS,
      name: 'Additional days',
    },
    {
      type: AdjudicationHistoryPunishmentTypeFilter.PROSPECTIVE_DAYS,
      name: 'Prospective additional days',
    },
    {
      type: AdjudicationHistoryPunishmentTypeFilter.SUSPENDED,
      name: 'Suspended',
    },
  ]
  return chosenPunishments.map(punishment => {
    return {
      value: punishment.type,
      text: punishment.name,
      checked: itemCheckBoxMatch(filter.punishment, punishment.type),
    }
  })
}

export const transferredInStatuses = [
  ReportedAdjudicationStatus.UNSCHEDULED,
  ReportedAdjudicationStatus.REFER_INAD,
  ReportedAdjudicationStatus.REFER_POLICE,
  ReportedAdjudicationStatus.ADJOURNED,
]

export const transferredOutStatuses = [ReportedAdjudicationStatus.AWAITING_REVIEW, ReportedAdjudicationStatus.SCHEDULED]

export const transferredAllStatuses = [...transferredInStatuses, ...transferredOutStatuses]

const getAvailableStatuses = (transferType: TransferredReportType) => {
  if (transferType === TransferredReportType.IN) {
    return transferredInStatuses
  }
  if (transferType === TransferredReportType.OUT) {
    return transferredOutStatuses
  }
  return transferredAllStatuses
}

export const transferredAdjudicationStatuses = (filter: TransfersUiFilter, transferType: TransferredReportType) => {
  const availableStatuses = getAvailableStatuses(transferType)
  return availableStatuses.map(key => {
    return {
      value: key,
      text: reportedAdjudicationStatusDisplayName(key as ReportedAdjudicationStatus),
      checked: itemCheckBoxMatch(filter.status, key as ReportedAdjudicationStatus),
    }
  })
}

export enum TransferredReportType {
  IN = 'IN',
  OUT = 'OUT',
  ALL = 'ALL',
}
