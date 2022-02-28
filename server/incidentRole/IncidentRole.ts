// eslint-disable-next-line no-shadow
enum IncidentRole {
  COMMITTED = 'committed',
  ATTEMPTED = 'attempted',
  INCITED = 'incited',
  ASSISTED = 'assisted',
}

const incidentRoleFromCode = (roleCode: string): IncidentRole => {
  switch (roleCode) {
    case '25a':
      return IncidentRole.ATTEMPTED
    case '25b':
      return IncidentRole.INCITED
    case '25c':
      return IncidentRole.ASSISTED
    default:
      return IncidentRole.COMMITTED
  }
}

const codeFromIncidentRole = (incidentRole: IncidentRole): string => {
  switch (incidentRole) {
    case IncidentRole.ATTEMPTED:
      return '25a'
    case IncidentRole.INCITED:
      return '25b'
    case IncidentRole.ASSISTED:
      return '25c'
    default:
      return null
  }
}

export { IncidentRole, incidentRoleFromCode, codeFromIncidentRole }
