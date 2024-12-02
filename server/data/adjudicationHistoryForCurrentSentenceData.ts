import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase, formatTimestampTo } from '../utils/utils'
import {
  ChargesWithSuspendedPunishments,
  Dis5AdjudicationsAndMoneyPrintSupport,
  LastReportedOffence,
} from './manageAdjudicationsSystemTokensClient'
import { PrisonerSearchDetailsDis5 } from '../services/prisonerSearchService'
import { PunishmentData } from './PunishmentResult'
import { DamageObligation } from './prisonApiClient'

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

  damageObligationsList: DamageObligation[]

  spends: number

  savings: number

  cash: number

  damageObligations: number

  constructor(
    chargeNumber: string,
    confirmedOnReportData: ConfirmedOnReportData,
    dis5Data: Dis5AdjudicationsAndMoneyPrintSupport,
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
    this.chargeProvedSentenceCount = dis5Data.previousCount || 0
    this.chargeProvedAtCurrentEstablishmentCount = dis5Data.previousAtCurrentEstablishmentCount || 0
    this.sameOffenceCount = dis5Data.sameOffenceCount || 0
    this.lastReportedOffence = dis5Data.lastReportedOffence || {}
    this.chargesWithSuspendedPunishments = dis5Data.chargesWithSuspendedPunishments || []
    this.existingPunishments = dis5Data.existingPunishments || []
    this.currentIncentiveLevel = prisonerSearchDis5Data.currentIncentiveLevel || 'Unknown'
    this.currentIncentiveLevelDateTime = prisonerSearchDis5Data.dateTimeOfLevel || 'Unknown'
    this.incentiveNextReviewDate = prisonerSearchDis5Data.nextReviewDate || 'Unknown'
    this.autoReleaseDate = prisonerSearchDis5Data.autoReleaseDate || 'Unknown'
    this.conditionalReleaseDate = prisonerSearchDis5Data.conditionalReleaseDate || 'Unknown'
    this.sentenceStartDate = prisonerSearchDis5Data.sentenceStartDate || 'Unknown'
    this.nonParoleDate = confirmedOnReportData.nonParoleDate || 'Unknown'
    this.acctAlertPresent = prisonerSearchDis5Data.acctAlertPresent || false
    this.csipAlertPresent = prisonerSearchDis5Data.csipAlertPresent || false
    this.damageObligationsList = dis5Data.damageObligations || []
    this.spends = dis5Data.balances.spends || 0
    this.savings = dis5Data.balances.savings || 0
    this.cash = dis5Data.balances.cash || 0
    this.damageObligations = dis5Data.balances.damageObligations || 0
  }
}
