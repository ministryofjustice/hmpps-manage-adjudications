import { PunishmentData } from './PunishmentResult'

export type ConfirmedOnReportData = {
  reportExpirationDateTime: string
  prisonerFirstName: string
  prisonerLastName: string
  prisonerNumber: string
  statement: string
  incidentAgencyName: string
  incidentLocationName: string
  reportingOfficer: string
  prisonerAgencyName: string
  prisonerLivingUnitName: string
  incidentDate: string
  prisonerPreferredNonEnglishLanguage?: string
  prisonerOtherLanguages?: Array<string>
  prisonerNeurodiversities?: Array<string>
  createdDateTime: string
  isYouthOffender: boolean
  prisonName?: string
}

export type ConfirmedOnReportChangedData = {
  reportExpirationDateTime: string
  prisonerFirstName: string
  prisonerLastName: string
  prisonerNumber: string
  reporter?: string
}

export type DIS7Data = {
  reportExpirationDateTime: string
  prisonerFirstName: string
  prisonerLastName: string
  prisonerNumber: string
  statement: string
  incidentAgencyName: string
  incidentLocationName: string
  prisonerAgencyName: string
  prisonerLivingUnitName: string
  incidentDate: string
  createdDateTime: string
  isYouthOffender: boolean
  prisonName?: string
  adjudicatorType: string
  ccPunishmentAwarded: boolean
  adaGiven: boolean
  lastHearingDate: string
  adjudicatorName: string
  damagesAmount: number
}
