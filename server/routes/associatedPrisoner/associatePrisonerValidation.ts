import { FormError } from '../../@types/template'
import { User } from '../../data/hmppsAuthClient'
import { AssociatedPrisonerLocation } from './associatePrisonerUtils'

type incidentAssistForm = {
  location: AssociatedPrisonerLocation
  associatedPrisonersNumber?: string
  associatedPrisonersName?: string
}

export const errors: { [key: string]: FormError } = {
  MISSING_SELECT: {
    href: '#selectedAnswerId',
    text: 'Select an option',
  },
  MISSING_INTERNAL_ASSOCIATED_PRISONER_ASSIST: {
    href: '#prisonerSearchNameInput',
    text: 'Enter the prisoner’s name or number',
  },
  MISSING_EXTERNAL_ASSOCIATED_PRISONER_ASSIST_NUMBER: {
    href: '#prisonerOutsideEstablishmentNumberInput',
    text: 'Enter the prisoner’s number',
  },
  MISSING_EXTERNAL_ASSOCIATED_PRISONER_ASSIST_NAME: {
    href: '#prisonerOutsideEstablishmentNameInput',
    text: 'Enter the prisoner’s name',
  },
  PRISONER_OUTSIDE_ESTABLISHMENT_INVALID_NUMBER: {
    href: `#prisonerOutsideEstablishmentNumberInput`,
    text: 'The prison number you have entered does not match a prisoner',
  },
}

export default function validateForm({
  location,
  associatedPrisonersNumber,
  associatedPrisonersName,
}: incidentAssistForm): FormError[] | null {
  if (location === AssociatedPrisonerLocation.UNKNOWN) {
    return [errors.MISSING_SELECT]
  }

  if (location === AssociatedPrisonerLocation.INTERNAL && !associatedPrisonersNumber) {
    return [errors.MISSING_INTERNAL_ASSOCIATED_PRISONER_ASSIST]
  }
  if (location === AssociatedPrisonerLocation.EXTERNAL) {
    const local: FormError[] = []
    if (!associatedPrisonersNumber) {
      local.push(errors.MISSING_EXTERNAL_ASSOCIATED_PRISONER_ASSIST_NUMBER)
    }
    if (!associatedPrisonersName) {
      local.push(errors.MISSING_EXTERNAL_ASSOCIATED_PRISONER_ASSIST_NAME)
    }

    return local.length === 0 ? null : local
  }

  return null
}
