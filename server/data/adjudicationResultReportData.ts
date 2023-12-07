import { DIS7Data } from './ConfirmedOnReportData'
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

  adjudicatorType: string

  ccPunishmentAwarded: boolean

  adaGiven: boolean

  adjudicatorName: string

  lastHearingDate: string

  damagesAmount: number

  constructor(chargeNumber: string, data: DIS7Data) {
    this.chargeNumber = chargeNumber
    this.prisonerDisplayName = convertToTitleCase(`${data.prisonerLastName}, ${data.prisonerFirstName}`)
    this.prisonerNumber = data.prisonerNumber
    this.prisonerLocationDescription = `${data.prisonerAgencyName} - ${data.prisonerLivingUnitName || 'Unknown'}`
    this.reportedDate = formatTimestampTo(data.createdDateTime, 'D MMMM YYYY')
    this.adjudicatorType = data.adjudicatorType
    this.ccPunishmentAwarded = data.ccPunishmentAwarded
    this.adaGiven = data.adaGiven
    this.isYOI = data.isYouthOffender
    this.adjudicatorName = data.adjudicatorName
    this.lastHearingDate = data.lastHearingDate
    this.damagesAmount = data.damagesAmount
    // this.canteenDaysMax = isYOI ? 21 : 42
    // this.facilitiesDaysMax = isYOI ? 21 : 42
    // this.privateCashDaysMax = isYOI ? 21 : 42
    // this.tvDaysMax = isYOI ? 21 : 42
    // this.associationDaysMax = isYOI ? 21 : 42
    // this.anyPrivilegeDaysMax = isYOI ? 21 : 42
    // this.stoppageOfEarningsDaysMax = isYOI ? 42 : 84
    // this.cellularConfinementDaysMax = isYOI ? 10 : 21
    // this.removalDaysMax = isYOI ? 21 : 28
    // this.daysAddedDaysMax = isYOI ? 42 : 42
    // this.prospectiveDaysMax = isYOI ? 42 : 42
    // this.applyMonths = isYOI ? 4 : 6
  }
}
