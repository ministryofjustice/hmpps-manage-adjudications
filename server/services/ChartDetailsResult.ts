import { AgencyId } from '../data/PrisonLocationResult'

export interface ChartDetailsResult {
  agencyId: AgencyId
  chartName: string
  characteristic?: string
  chartEntries: ChartEntryVerticalBar[] | ChartEntryHorizontalBar[] | ChartEntryLine[] | ChartEntryDuoLine[]
}

export interface ChartLastUpdatedResult {
  chartName: string
  lastModifiedDate: Date
}

export interface ChartEntryVerticalBar {
  month: number
  year_curr: number
  year_prev: number
  count_curr: number
  count_prev: number
}

export interface ChartEntryHorizontalBar {
  incident_loc?: string
  offence_type?: string
  wing_loc?: string
  value?: string
  characteristic?: string
  finding?: string
  plea?: string
  sanction?: string
  count: number
  proportion: number
}

export interface ChartEntryLine {
  offence_type?: string
  plea?: string
  finding?: string
  sanction?: string
  status?: string
  month: number
  year: number
  count: number
  proportion: number
}

export interface ChartEntryDuoLine {
  month: number
  year: number
  count: number
  count_one: number
  count_more: number
  prop_one: number
  prop_more: number
}

export interface ChartEntryCommentary {
  data: string | number
  proportion: string
}

export interface TableRowEntry {
  label: string
  data: number[] | string[]
}

export interface TableHead {
  text: string
  classes: string
}

export interface TableRow {
  text: string | number
  classes: string
}

export interface RowSource {
  source: (row: ChartEntryHorizontalBar | ChartEntryLine | ChartEntryDuoLine) => number | string | ChartEntryCommentary
}

export interface DataFilter {
  filter: (row: ChartEntryHorizontalBar | ChartEntryLine) => boolean
}

export const ALL_DATA_FILTER = {
  filter: () => true,
} as DataFilter

export const MONTH_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const getMonthShortName = (monthNumber: number) => {
  return monthNumber > 0 && monthNumber < 13 ? MONTH_SHORT_NAMES[Math.trunc(monthNumber) - 1] : 'Wrong'
}
