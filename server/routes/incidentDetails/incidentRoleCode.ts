export const radioToIncidentRole = (radio: string): string => {
  switch (radio) {
    case 'onTheirOwn':
      return null
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

export default {
  radioToIncidentRole,
}
