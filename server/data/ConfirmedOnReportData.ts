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
}

export type ConfirmedOnReportChangedData = {
  reportExpirationDateTime: string
  prisonerFirstName: string
  prisonerLastName: string
  prisonerNumber: string
  reporter?: string
}
