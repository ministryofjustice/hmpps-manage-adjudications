import type { SuperAgentRequest } from 'superagent'
import { stubFor, stubPing } from './wiremock'

export default {
  stubPing: (httpStatus = 200): SuperAgentRequest => stubPing('/verification', httpStatus),

  stubVerifyToken: (status = 200, active = true): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/verification/token/verify',
      },
      response: {
        status,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { active },
      },
    }),
}
