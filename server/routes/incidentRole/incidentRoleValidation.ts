import { FormError } from '../../@types/template'

type incidentRoleForm = {
  incidentRole?: string
  associatedPrisonersNumber?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_ROLE: {
    href: '#currentRadioSelected',
    text: 'Select the prisoner’s role in this incident',
  },
  MISSING_ASSOCIATED_PRISONER_INCITE: {
    href: '#incitedInput',
    text: 'Enter the prisoner’s name or number',
  },
  MISSING_ASSOCIATED_PRISONER_ASSIST: {
    href: '#assistedInput',
    text: 'Enter the prisoner’s name or number',
  },
}

export default function validateForm({ incidentRole, associatedPrisonersNumber }: incidentRoleForm): FormError | null {
  if (!incidentRole) {
    return errors.MISSING_ROLE
  }
  if (incidentRole === 'incited' && !associatedPrisonersNumber) {
    return errors.MISSING_ASSOCIATED_PRISONER_INCITE
  }
  if (incidentRole === 'assisted' && !associatedPrisonersNumber) {
    return errors.MISSING_ASSOCIATED_PRISONER_ASSIST
  }

  return null
}
