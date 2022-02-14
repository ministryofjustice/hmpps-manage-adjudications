import { FormError } from '../../@types/template'
import { AnotherData, DecisionForm, OfficerData, PrisonerData, StaffData } from './decisionForm'
import decisionTree from '../../offenceCodeDecisions/DecisionTree'
import { DecisionType } from '../../offenceCodeDecisions/Decision'

// eslint-disable-next-line no-shadow
enum ErrorType {
  MISSING_DECISION = 'MISSING_DECISION',
  STAFF_MISSING_FIRST_NAME_INPUT_SUBMIT = 'STAFF_MISSING_FIRST_NAME_INPUT_SUBMIT',
  STAFF_MISSING_LAST_NAME_INPUT_SUBMIT = 'STAFF_MISSING_LAST_NAME_INPUT_SUBMIT',
  STAFF_MISSING_FIRST_NAME_INPUT_SEARCH = 'STAFF_MISSING_FIRST_NAME_INPUT_SEARCH',
  STAFF_MISSING_LAST_NAME_INPUT_SEARCH = 'STAFF_MISSING_LAST_NAME_INPUT_SEARCH',
  OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT = 'OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT',
  OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT = 'OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT',
  OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH = 'OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH',
  OFFICER_MISSING_LAST_NAME_INPUT_SEARCH = 'OFFICER_MISSING_LAST_NAME_INPUT_SEARCH',
  PRISONER_MISSING_NAME_INPUT_SEARCH = 'PRISONER_MISSING_NAME_INPUT_SEARCH',
  PRISONER_MISSING_NAME_INPUT_SUBMIT = 'PRISONER_MISSING_NAME_INPUT_SUBMIT',
  ANOTHER_MISSING_NAME_INPUT = 'ANOTHER_MISSING_NAME_INPUT',
}

const error: { [key in ErrorType]: FormError } = {
  MISSING_DECISION: {
    href: '#selectedDecisionId',
    text: 'Please make a choice',
  },
  STAFF_MISSING_FIRST_NAME_INPUT_SUBMIT: {
    href: '#staffSearchFirstNameInput',
    text: 'Search for a member of staff',
  },
  STAFF_MISSING_LAST_NAME_INPUT_SUBMIT: {
    href: '#staffSearchLastNameInput',
    text: 'Search for a member of staff',
  },
  STAFF_MISSING_FIRST_NAME_INPUT_SEARCH: {
    href: '#staffSearchFirstNameInput',
    text: 'Enter their first name',
  },
  STAFF_MISSING_LAST_NAME_INPUT_SEARCH: {
    href: '#staffSearchLastNameInput',
    text: 'Enter their last name',
  },
  OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT: {
    href: '#officerSearchFirstNameInput',
    text: 'Search for a prison officer',
  },
  OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT: {
    href: '#officerSearchLastNameInput',
    text: 'Search for a prison officer',
  },
  OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH: {
    href: '#officerSearchFirstNameInput',
    text: 'Enter their first name',
  },
  OFFICER_MISSING_LAST_NAME_INPUT_SEARCH: {
    href: '#officerSearchLastNameInput',
    text: 'Enter their last name',
  },
  PRISONER_MISSING_NAME_INPUT_SEARCH: {
    href: `#prisonerSearchNameInput`,
    text: 'Enter their name or prison number',
  },
  PRISONER_MISSING_NAME_INPUT_SUBMIT: {
    href: `#prisonerSearchNameInput`,
    text: 'Search for a prisoner',
  },
  ANOTHER_MISSING_NAME_INPUT: {
    href: `#anotherNameInput`,
    text: 'You must enter a name',
  },
}

// What is valid depends on whether this is a normal submit or one searching for a user.
// This method is tightly bound to the njk page validation names.
export default function validateForm(decisionForm: DecisionForm, searching: boolean): FormError[] {
  const { selectedDecisionId } = decisionForm
  if (!selectedDecisionId) {
    return [error.MISSING_DECISION]
  }
  switch (decisionTree.findById(selectedDecisionId).getType()) {
    case DecisionType.STAFF:
      return staffValidation(decisionForm.selectedDecisionData as StaffData, searching)
    case DecisionType.OFFICER:
      return officerValidation(decisionForm.selectedDecisionData as OfficerData, searching)
    case DecisionType.PRISONER:
      return prisonerValidation(decisionForm.selectedDecisionData as PrisonerData, searching)
    case DecisionType.ANOTHER:
      return anotherValidation(decisionForm.selectedDecisionData as AnotherData)
    default:
      break
  }
  return []
}

function prisonerValidation(prisonerData: PrisonerData, searching: boolean): FormError[] {
  if (searching) {
    if (!prisonerData.prisonerSearchNameInput) {
      return [error.PRISONER_MISSING_NAME_INPUT_SEARCH]
    }
  }
  if (!prisonerData.prisonerId && !searching) {
    return [error.PRISONER_MISSING_NAME_INPUT_SUBMIT]
  }
  return []
}

function staffValidation(staffData: StaffData, searching: boolean): FormError[] {
  if (searching) {
    const errors = []
    if (!staffData.staffSearchFirstNameInput) {
      errors.push(error.STAFF_MISSING_FIRST_NAME_INPUT_SEARCH)
    }
    if (!staffData.staffSearchLastNameInput) {
      errors.push(error.STAFF_MISSING_LAST_NAME_INPUT_SEARCH)
    }
    return errors
  }
  if (!staffData.staffId && !searching) {
    return [error.STAFF_MISSING_FIRST_NAME_INPUT_SUBMIT, error.STAFF_MISSING_LAST_NAME_INPUT_SUBMIT]
  }
  return []
}

function officerValidation(officerData: OfficerData, searching: boolean): FormError[] {
  if (searching) {
    const errors = []
    if (!officerData.officerSearchFirstNameInput) {
      errors.push(error.OFFICER_MISSING_FIRST_NAME_INPUT_SEARCH)
    }
    if (!officerData.officerSearchLastNameInput) {
      errors.push(error.OFFICER_MISSING_LAST_NAME_INPUT_SEARCH)
    }
    return errors
  }
  if (!officerData.officerId && !searching) {
    return [error.OFFICER_MISSING_FIRST_NAME_INPUT_SUBMIT, error.OFFICER_MISSING_LAST_NAME_INPUT_SUBMIT]
  }
  return []
}

function anotherValidation(anotherData: AnotherData): FormError[] {
  if (!anotherData.anotherNameInput) {
    return [error.ANOTHER_MISSING_NAME_INPUT]
  }
  return []
}
