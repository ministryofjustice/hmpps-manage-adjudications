import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase } from '../utils/utils'
import { IncidentAndOffences } from '../services/decisionTreeService'
import { DamageDetails, EvidenceDetails, WitnessDetails } from './DraftAdjudicationResult'

type EvidenceDetailsSplit = {
  baggedAndTagged: EvidenceDetails[]
  photoVideo: EvidenceDetails[]
}

export default class prepareAndRecordAnAdjudicationHearingData {
  chargeNumber: string

  establishmentName: string

  prisonerDisplayName: string

  prisonerNumber: string

  offences: IncidentAndOffences

  isYouthOffender: boolean

  damages: DamageDetails[]

  evidence: EvidenceDetailsSplit

  witnesses: WitnessDetails[]

  constructor(
    chargeNumber: string,
    confirmedOnReportData: ConfirmedOnReportData,
    offences: IncidentAndOffences,
    damages: DamageDetails[],
    evidence: EvidenceDetailsSplit,
    witnesses: WitnessDetails[]
  ) {
    this.chargeNumber = chargeNumber
    this.establishmentName = confirmedOnReportData.prisonName
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`
    )
    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.offences = offences
    this.isYouthOffender = confirmedOnReportData.isYouthOffender
    this.damages = damages
    this.evidence = evidence
    this.witnesses = witnesses
  }
}
