import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/search/health/ping',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubSearch = ({ query, results }: Record<string, unknown>): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/search/prisoner-search/match-prisoners',
      ...((query && { bodyPatterns: [{ equalToJson: query }] }) || {}),
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: results,
    },
  })

const stubSearchPrisonerDetails = ({ prisonerNumber, status = 200 }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/search/prisoner/${prisonerNumber}`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        prisonerNumber,
      },
    },
  })

// The hmpps-prison-permissions-lib guard looks up the prisoner in prisoner-search (GET /prisoner/{n})
// using a system token and only reads prisonId / restrictedPatient to decide access, so a catch-all
// stub returning a prisoner inside the user's caseload (MDI) is enough to let the guarded pages load.
const stubGetPrisonerPermissionDetails = ({ prisonId = 'MDI', restrictedPatient = false } = {}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPathPattern: '/search/prisoner/[A-Za-z0-9]+',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { prisonId, restrictedPatient },
    },
  })

export default {
  stubPing,
  stubSearch,
  stubSearchPrisonerDetails,
  stubGetPrisonerPermissionDetails,
}
