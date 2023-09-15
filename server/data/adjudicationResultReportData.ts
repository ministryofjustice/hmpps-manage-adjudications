import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo } from '../utils/utils'

export default class adjudicationResultReportData {
  chargeNumber: string

  prisonerDisplayName: string

  prisonerNumber: string

  prisonerLocationDescription: string

  reportedDate: string

  isYOI: boolean

  canteenDaysMax: number

  facilitiesDaysMax: number

  privateCashDaysMax: number

  tvDaysMax: number

  associationDaysMax: number

  anyPrivilegeDaysMax: number

  stoppageOfEarningsDaysMax: number

  cellularConfinementDaysMax: number

  removalDaysMax: number

  daysAddedDaysMax: number

  prospectiveDaysMax: number

  applyMonths: number

  constructor(chargeNumber: string, confirmedOnReportData: ConfirmedOnReportData, isYOI: boolean) {
    this.chargeNumber = chargeNumber
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${
      confirmedOnReportData.prisonerLivingUnitName || 'Unknown'
    }`
    this.reportedDate = formatTimestampTo(confirmedOnReportData.createdDateTime, 'D MMMM YYYY')
    this.isYOI = isYOI
    this.canteenDaysMax = isYOI ? 21 : 42
    this.facilitiesDaysMax = isYOI ? 21 : 42
    this.privateCashDaysMax = isYOI ? 21 : 42
    this.tvDaysMax = isYOI ? 21 : 42
    this.associationDaysMax = isYOI ? 21 : 42
    this.anyPrivilegeDaysMax = isYOI ? 21 : 42
    this.stoppageOfEarningsDaysMax = isYOI ? 42 : 84
    this.cellularConfinementDaysMax = isYOI ? 10 : 21
    this.removalDaysMax = isYOI ? 21 : 28
    this.daysAddedDaysMax = isYOI ? 42 : 42
    this.prospectiveDaysMax = isYOI ? 42 : 42
    this.applyMonths = isYOI ? 4 : 6
  }
}
