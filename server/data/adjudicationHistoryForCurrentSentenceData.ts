import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo } from '../utils/utils'
import {
  ChargesWithSuspendedPunishments,
  Dis5PrintSupport,
  LastReportedOffence,
} from './manageAdjudicationsSystemTokensClient'
import { PrisonerSearchDetailsDis5 } from '../services/prisonerSearchService'
import { PunishmentData } from './PunishmentResult'

export default class adjudicationHistoryForCurrentSentenceData {
  chargeNumber: string

  prisonerDisplayName: string

  prisonerFriendlyName: string

  prisonerNumber: string

  prisonerLocationDescription: string

  discoveryDate: string

  chargeProvedSentenceCount: number

  chargeProvedAtCurrentEstablishmentCount: number

  sameOffenceCount: number

  lastReportedOffence: LastReportedOffence | Record<string, never>

  chargesWithSuspendedPunishments: ChargesWithSuspendedPunishments[]

  currentIncentiveLevel: string

  currentIncentiveLevelDateTime: string

  incentiveNextReviewDate: string

  existingPunishments: PunishmentData[]

  autoReleaseDate: string

  conditionalReleaseDate: string

  sentenceStartDate: string

  nonParoleDate: string

  acctAlertPresent: boolean

  csipAlertPresent: boolean

  constructor(
    chargeNumber: string,
    confirmedOnReportData: ConfirmedOnReportData,
    dis5Data: Dis5PrintSupport,
    prisonerSearchDis5Data: PrisonerSearchDetailsDis5
  ) {
    this.chargeNumber = chargeNumber

    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerFriendlyName = convertToTitleCase(
      `${confirmedOnReportData.prisonerFirstName} ${confirmedOnReportData.prisonerLastName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${
      confirmedOnReportData.prisonerLivingUnitName || 'Unknown'
    }`
    this.discoveryDate = formatTimestampTo(dis5Data.dateOfDiscovery, 'dddd, D MMMM YYYY')
    this.chargeProvedSentenceCount = dis5Data.previousCount
    this.chargeProvedAtCurrentEstablishmentCount = dis5Data.previousAtCurrentEstablishmentCount
    this.sameOffenceCount = dis5Data.sameOffenceCount
    this.lastReportedOffence = dis5Data.lastReportedOffence || {}
    this.chargesWithSuspendedPunishments = dis5Data.chargesWithSuspendedPunishments
    this.existingPunishments = dis5Data.existingPunishments
    this.currentIncentiveLevel = prisonerSearchDis5Data.currentIncentiveLevel
    this.currentIncentiveLevelDateTime = prisonerSearchDis5Data.dateTimeOfLevel
    this.incentiveNextReviewDate = prisonerSearchDis5Data.nextReviewDate
    this.autoReleaseDate = prisonerSearchDis5Data.autoReleaseDate
    this.conditionalReleaseDate = prisonerSearchDis5Data.conditionalReleaseDate
    this.sentenceStartDate = prisonerSearchDis5Data.sentenceStartDate
    this.nonParoleDate = confirmedOnReportData.nonParoleDate
    this.acctAlertPresent = prisonerSearchDis5Data.acctAlertPresent
    this.csipAlertPresent = prisonerSearchDis5Data.csipAlertPresent
  }
}
