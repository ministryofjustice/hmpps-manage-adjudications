import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo } from '../utils/utils'

export default class adjudicationResultReportData {
  chargeNumber: string

  establishmentName: string

  prisonerDisplayName: string

  prisonerNumber: string

  isYOI: boolean

  prisonerLocationDescription: string

  reportedDate: string

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

  constructor(chargeNumber: string, confirmedOnReportData: ConfirmedOnReportData) {
    this.chargeNumber = chargeNumber
    this.establishmentName = confirmedOnReportData.prisonName
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${
      confirmedOnReportData.prisonerLivingUnitName || 'Unknown'
    }`
    this.reportedDate = formatTimestampTo(confirmedOnReportData.createdDateTime, 'D MMMM YYYY')
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.isYOI = confirmedOnReportData.isYouthOffender
    this.canteenDaysMax = confirmedOnReportData.isYouthOffender ? 21 : 42
    this.facilitiesDaysMax = confirmedOnReportData.isYouthOffender ? 21 : 42
    this.privateCashDaysMax = confirmedOnReportData.isYouthOffender ? 21 : 42
    this.tvDaysMax = confirmedOnReportData.isYouthOffender ? 21 : 42
    this.associationDaysMax = confirmedOnReportData.isYouthOffender ? 21 : 42
    this.anyPrivilegeDaysMax = confirmedOnReportData.isYouthOffender ? 21 : 42
    this.stoppageOfEarningsDaysMax = confirmedOnReportData.isYouthOffender ? 42 : 84
    this.cellularConfinementDaysMax = confirmedOnReportData.isYouthOffender ? 10 : 21
    this.removalDaysMax = confirmedOnReportData.isYouthOffender ? 21 : 28
    this.daysAddedDaysMax = confirmedOnReportData.isYouthOffender ? 42 : 42
    this.prospectiveDaysMax = confirmedOnReportData.isYouthOffender ? 42 : 42
    this.applyMonths = confirmedOnReportData.isYouthOffender ? 4 : 6
  }
}
