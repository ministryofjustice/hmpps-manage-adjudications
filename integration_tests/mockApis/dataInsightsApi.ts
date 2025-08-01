import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/health/ping',
    },
    response: {
      status,
    },
  })

export default {
  stubPing,
}
