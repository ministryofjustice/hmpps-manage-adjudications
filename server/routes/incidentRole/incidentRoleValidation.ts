import { FormError } from '../../@types/template'

type incidentRoleForm = {
  incidentRole?: string
}

const errors: { [key: string]: FormError } = {
  MISSING_ROLE: {
    href: '#currentRadioSelected',
    text: 'Select the prisoner’s role in this incident',
  },
}

export default function validateForm({ incidentRole }: incidentRoleForm): FormError | null {
  if (!incidentRole) {
    return errors.MISSING_ROLE
  }

  return null
}
