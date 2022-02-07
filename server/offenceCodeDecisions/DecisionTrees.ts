import committedDecisionTree from './CommitedDecisionTree'
import Decision from './Decision'
import IncidentRole from '../incidentRole/IncidentRole'

export default new Map<IncidentRole, Decision>([[IncidentRole.COMMITTED, committedDecisionTree]])
