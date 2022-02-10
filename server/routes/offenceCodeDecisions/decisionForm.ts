// Form data backing a decision. Used in form submits and to allow the saving of form data on a decision page so that
// we can repopulate it when returning from a user lookup.
export type DecisionForm = {
  selectedDecisionId?: string
  selectedDecisionData?: StaffData | OfficerData | PrisonerData
}
export type SelectUserData = {
  userId?: string
  userSearch?: string
}

export type StaffData = SelectUserData
export type OfficerData = SelectUserData
export type PrisonerData = SelectUserData
