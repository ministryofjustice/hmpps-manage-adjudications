import { AgencyId } from '../data/PrisonLocationResult'

export interface ChartDetailsResult {
  agencyId: AgencyId
  chartName: string
  chartEntries: ChartEntry[]
}

export interface ChartEntry {
  month: number
  year_curr: number
  year_prev: number
  count_curr: number
  count_prev: number
}

export const MONTH_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const getMonthShortName = (monthNumber: number) => {
  return monthNumber > 0 && monthNumber < 13 ? MONTH_SHORT_NAMES[monthNumber - 1] : 'Wrong'
}
