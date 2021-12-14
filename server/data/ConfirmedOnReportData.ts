export type ConfirmedOnReportData = SimplifiedConfirmedOnReportData & {
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

export type SimplifiedConfirmedOnReportData = {
  reportExpirationDateTime: string
  prisonerFirstName: string
  prisonerLastName: string
  prisonerNumber: string
}
