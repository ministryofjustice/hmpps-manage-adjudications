import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo } from '../utils/utils'
import { Dis5PrintSupport, LastReportedOffence } from './manageAdjudicationsSystemTokensClient'
import { SuspendedPunishment } from './PunishmentResult'

export default class adjudicationHistoryForCurrentSentenceData {
  chargeNumber: string

  prisonerDisplayName: string

  prisonerNumber: string

  prisonerLocationDescription: string

  incidentDate: string

  discoveryDate: string

  chargeProvedSentenceCount: number

  chargeProvedAtCurrentEstablishmentCount: number

  sameOffenceCount: number

  lastReportedOffence: LastReportedOffence | Record<string, never>

  lastReportedOffenceDiscoveryDate: string

  suspendedPunishments: SuspendedPunishment[]

  constructor(chargeNumber: string, confirmedOnReportData: ConfirmedOnReportData, dis5Data: Dis5PrintSupport) {
    this.chargeNumber = chargeNumber

    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${
      confirmedOnReportData.prisonerLivingUnitName || 'Unknown'
    }`
    this.incidentDate = formatTimestampTo(dis5Data.dateOfIncident, 'dddd, D MMMM YYYY')
    this.chargeProvedSentenceCount = dis5Data.previousCount
    this.chargeProvedAtCurrentEstablishmentCount = dis5Data.previousAtCurrentEstablishmentCount
    this.sameOffenceCount = dis5Data.sameOffenceCount
    this.lastReportedOffence = dis5Data.lastReportedOffence || {}
    this.lastReportedOffenceDiscoveryDate = formatTimestampTo(
      dis5Data.lastReportedOffence.dateOfDiscovery,
      'dddd, D MMMM YYYY'
    )
    this.suspendedPunishments = dis5Data.suspendedPunishments
  }
}
