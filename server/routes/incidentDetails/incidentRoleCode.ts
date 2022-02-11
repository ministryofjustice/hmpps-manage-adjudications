export const radioToIncidentRole = (radio: string): string => {
  switch (radio) {
    case 'attemptOnTheirOwn':
      return '25a'
    case 'inciteAnotherPrisoner':
      return '25b'
    case 'assistAnotherPrisoner':
      return '25c'
    default:
      return null
  }
}

export const incidentRoleToRadio = (radio: string): string => {
  switch (radio) {
    case '25a':
      return 'attemptOnTheirOwn'
    case '25b':
      return 'inciteAnotherPrisoner'
    case '25c':
      return 'assistAnotherPrisoner'
    default:
      return 'onTheirOwn'
  }
}

export default {
  radioToIncidentRole,
  incidentRoleToRadio,
}
