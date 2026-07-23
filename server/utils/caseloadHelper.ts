import { CaseLoad } from '../data/prisonApiClient'

// The adjudications API is called with a system token and told which caseload to act as via the
// Active-Caseload header, so it cannot police who the user is. Access to a prisoner's adjudication
// data has to be restricted here, against the caseloads the user actually holds.
export const prisonerIsInUsersCaseloads = (prisonerAgencyId: string, user: { allCaseLoads?: CaseLoad[] }): boolean =>
  !!prisonerAgencyId && (user.allCaseLoads || []).some(caseLoad => caseLoad.caseLoadId === prisonerAgencyId)

export default prisonerIsInUsersCaseloads
