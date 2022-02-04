import committed from './Commited'
import Decision from './Decision'
import type IncidentRole from './IncidentRoles'

export default new Map<IncidentRole, Decision>([['committed', committed]])
