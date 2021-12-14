export type ConfirmedOnReportData = {
  reportExpirationDateTime: string
  prisonerFirstName: string
  prisonerLastName: string
  prisonerNumber: string
  reporter?: string
  prisonerPreferredNonEnglishLanguage?: string
  prisonerOtherLanguages?: Array<string>
  prisonerNeurodiversities?: Array<string>
}
