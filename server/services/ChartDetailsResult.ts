import { AgencyId } from '../data/PrisonLocationResult'

export interface ChartDetailsResult {
  agencyId: AgencyId
  chartName: string
  characteristic?: string
  chartEntries: ChartEntryVerticalBar[] | ChartEntryHorizontalBar[]
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
  count: number
  proportion: number
  proportion_round: number
}

export interface ChartEntryLine {
  offence_type: string
  month: number
  year: number
  count: number
  proportion: number
  proportion_round: number
}

export interface ChartEntryCommentary {
  count: number
  proportion_round: string
}

export interface RowSource {
  source: (row: ChartEntryHorizontalBar | ChartEntryLine) => number | string | ChartEntryCommentary
}

export interface DataFilter {
  filter: (row: ChartEntryHorizontalBar) => boolean
}

export const MONTH_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const getMonthShortName = (monthNumber: number) => {
  return monthNumber > 0 && monthNumber < 13 ? MONTH_SHORT_NAMES[Math.trunc(monthNumber) - 1] : 'Wrong'
}
