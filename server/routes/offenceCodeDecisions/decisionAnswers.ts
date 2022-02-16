// Allows the recording of additional data when answering questions to be retained while progressing through decisions.
export type DecisionAnswers = {
  victimOfficer?: string
  victimStaff?: string
  victimPrisoner?: string
  victimOtherPerson?: string
  offenceCode: number
}
