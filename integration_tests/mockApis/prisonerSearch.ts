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

const stubSearch = ({ query, results }): SuperAgentRequest => {
  return stubFor({
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
}

export default {
  stubPing,
  stubSearch,
}
