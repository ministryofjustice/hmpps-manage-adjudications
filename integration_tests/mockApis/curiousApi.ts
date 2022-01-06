import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubGetNeurodiversities = ({
  id,
  response = {},
}: {
  id: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/draft-adjudications/${id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/curious/ping',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

export default {
  stubGetNeurodiversities,
  stubPing,
}
