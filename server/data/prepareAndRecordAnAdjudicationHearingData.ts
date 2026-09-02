import { ConfirmedOnReportData } from './ConfirmedOnReportData'
import { convertToTitleCase } from '../utils/utils'
import { IncidentAndOffences } from '../services/decisionTreeService'
import { DamageDetails, EvidenceDetails, WitnessDetails } from './DraftAdjudicationResult'

type EvidenceDetailsSplit = {
  baggedAndTagged: EvidenceDetails[]
  photoVideo: EvidenceDetails[]
  other: EvidenceDetails[]
}

export default class prepareAndRecordAnAdjudicationHearingData {
  chargeNumber: string

  prisonerDisplayName: string

  prisonerNumber: string

  offences: IncidentAndOffences

  isYOI: boolean

  prisonerLocationDescription: string

  damages: DamageDetails[]

  evidence: EvidenceDetailsSplit

  witnesses: WitnessDetails[]

  prisonerDateOfBirth: string

  prisonerAge: { years: number; months: number }

  constructor(
    chargeNumber: string,
    confirmedOnReportData: ConfirmedOnReportData,
    offences: IncidentAndOffences,
    damages: DamageDetails[],
    evidence: EvidenceDetailsSplit,
    witnesses: WitnessDetails[],
    prisonerDateOfBirth: string,
    prisonerAge: { years: number; months: number },
  ) {
    this.chargeNumber = chargeNumber
    this.prisonerDisplayName = convertToTitleCase(
      `${confirmedOnReportData.prisonerLastName}, ${confirmedOnReportData.prisonerFirstName}`,
    )
    this.prisonerLocationDescription = `${confirmedOnReportData.prisonerAgencyName} - ${
      confirmedOnReportData.prisonerLivingUnitName || 'Unknown'
    }`

    this.prisonerNumber = confirmedOnReportData.prisonerNumber
    this.offences = offences
    this.isYOI = confirmedOnReportData.isYouthOffender
    this.damages = damages
    this.evidence = evidence
    this.witnesses = witnesses
    this.prisonerDateOfBirth = prisonerDateOfBirth
    this.prisonerAge = prisonerAge
  }
}
