// Form data backing a decision. Used in form submits and to allow the saving of form data on a decision page so that
// we can repopulate it when returning from a user lookup.
export type DecisionForm = {
  selectedDecisionId?: string
  selectedDecisionData?: StaffData | OfficerData | PrisonerData
}
export type StaffData = {
  staffId?: string
  staffSearchFirstNameInput?: string
  staffSearchLastNameInput?: string
}
export type OfficerData = {
  officerId?: string
  officerSearchFirstNameInput?: string
  officerSearchLastNameInput?: string
}
export type PrisonerData = {
  prisonerId?: string
  prisonerSearchNameInput?: string
}
