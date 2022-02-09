// Form data backing a decision. Used in form submits and to allow the saving of form data on a decision page so that
// we can repopulate it when returning from a user lookup.
export type DecisionForm = {
  selectedDecisionId?: string
  userLookup?: string
}
