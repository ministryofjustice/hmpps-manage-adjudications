// Form data backing a decision. Used in form submits and to allow the saving of form data on a decision page. This
// allows consistent validation and saving backing state when navigating away from a page to do e.f. prisoner search.
export type DecisionForm = {
  selectedAnswerId?: string
  selectedAnswerData?: StaffData | OfficerData | PrisonerData | OtherPersonData | PrisonerOutsideEstablishmentData
}
export type StaffData = {
  staffId?: string
  staffSearchNameInput?: string
}
export type OfficerData = {
  officerId?: string
  officerSearchNameInput?: string
}
export type PrisonerData = {
  prisonerId?: string
  prisonerSearchNameInput?: string
}

export type OtherPersonData = {
  otherPersonNameInput?: string
  otherPersonFirstNameInput?: string
  otherPersonLastNameInput?: string
}

export type PrisonerOutsideEstablishmentData = {
  otherPersonNameInput?: string
  victimPrisonersNumber?: string
}
