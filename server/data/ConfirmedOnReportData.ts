export type EnhancedConfirmedOnReportData = ConfirmedOnReportData & {
  prisonerPreferredNonEnglishLanguage?: string
  prisonerOtherLanguages?: Array<string>
  prisonerNeurodiversities?: Array<string>
  statement: string
  incidentAgencyName: string
  incidentLocationName: string
  reportingOfficer: string
  prisonerAgencyName: string
  prisonerLivingUnitName: string
  incidentDate: string
}

export type ConfirmedOnReportData = {
  reportExpirationDateTime: string
  prisonerFirstName: string
  prisonerLastName: string
  prisonerNumber: string
  reporter?: string
}
