import { DIS7Data } from './ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo } from '../utils/utils'
import { PunishmentDataWithSchedule } from './PunishmentResult'

export default class adjudicationResultReportData {
  chargeNumber: string

  prisonerDisplayName: string

  prisonerNumber: string

  prisonerLocationDescription: string

  reportedDate: string

  isYOI: boolean

  adjudicatorType: string

  ccPunishmentAwarded: boolean

  adaGiven: boolean

  adjudicatorName: string

  lastHearingDate: string

  damagesAmount: number

  cautionGiven: boolean

  punishments: PunishmentDataWithSchedule[]

  suspendedPunishments: PunishmentDataWithSchedule[]

  suspendedPunishmentsPresent: boolean

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
    this.cautionGiven = data.cautionGiven
    this.punishments = data.punishments
    this.suspendedPunishments = data.suspendedPunishments
    this.suspendedPunishmentsPresent = data.suspendedPunishmentsPresent
  }
}
