import { OffenceRule } from '../data/DraftAdjudicationResult'

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

const incidentRule = (incidentRole: IncidentRole): OffenceRule => {
  switch (incidentRole) {
    case IncidentRole.ATTEMPTED:
      return {
        paragraphNumber: '25(a)',
        paragraphDescription: 'Attempts to commit any of the foregoing offences',
      }
    case IncidentRole.INCITED:
      return {
        paragraphNumber: '25(b)',
        paragraphDescription: 'Incites another prisoner to commit any of the foregoing offences',
      }
    case IncidentRole.ASSISTED:
      return {
        paragraphNumber: '25(c)',
        paragraphDescription:
          'Assists another prisoner to commit, or to attempt to commit, any of the foregoing offences',
      }
    case IncidentRole.COMMITTED:
    default:
      return null
  }
}

export { IncidentRole, incidentRoleFromCode, incidentRule }
