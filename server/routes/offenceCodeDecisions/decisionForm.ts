// Form data backing a decision. Used in form submits and to allow the saving of form data on a decision page. This
// allows consistent validation and saving backing state when navigating away from a page to do e.f. prisoner search.
export type DecisionForm = {
  selectedDecisionId?: string
  selectedDecisionData?: StaffData | OfficerData | PrisonerData | AnotherData
}
// TODO put in the helper classes.
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

export type AnotherData = {
  anotherNameInput?: string
}
