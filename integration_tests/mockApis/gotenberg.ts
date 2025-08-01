import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/gotenberg/health',
    },
    response: {
      status,
    },
  })

export default {
  stubPing,
}
