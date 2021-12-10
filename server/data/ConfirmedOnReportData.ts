export type ConfirmedOnReportData = SimplifiedConfirmedOnReportData & {
  prisonerPreferredNonEnglishLanguage?: string
  prisonerOtherLanguages?: Array<string>
  prisonerNeurodiversities?: Array<string>
  statement: string
  agencyName: string
  locationName: string
  reportingOfficer: string
}

export type SimplifiedConfirmedOnReportData = {
  reportExpirationDateTime: string
  prisonerFirstName: string
  prisonerLastName: string
  prisonerNumber: string
}
