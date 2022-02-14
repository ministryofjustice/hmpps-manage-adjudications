// Form data backing a decision. Used in form submits and to allow the saving of form data on a decision page so that
// we can repopulate it when returning from a user lookup.
export type DecisionForm = {
  selectedDecisionId?: string
  selectedDecisionData?: StaffData | OfficerData | PrisonerData
}
export type SelectPrisonerData = {
  userId?: string
  userSearchInput?: string
}

export type SelectStaffData = {
  userId?: string
  userSearchFirstNameInput?: string
  userSearchLastNameInput?: string
}

export type StaffData = SelectStaffData
export type OfficerData = SelectStaffData
export type PrisonerData = SelectPrisonerData
