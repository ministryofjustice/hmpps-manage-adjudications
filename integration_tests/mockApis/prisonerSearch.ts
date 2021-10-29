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

export default {
  stubPing,
}
