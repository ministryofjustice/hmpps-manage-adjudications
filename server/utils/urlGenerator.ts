import { IncidentRole } from '../incidentRole/IncidentRole'

export const offenceCodeSelection = {
  root: '/offence-code-selection',
  path: (incidentRole: IncidentRole, questionUrl: string) =>
    `/:adjudicationNumber/:incidentRole(${IncidentRole[incidentRole]})/${questionUrl}`,
  pathToStart: (incidentRole: IncidentRole) => `/:adjudicationNumber/:incidentRole(${IncidentRole[incidentRole]})`,
}

export const detailsOfOffence = {}
