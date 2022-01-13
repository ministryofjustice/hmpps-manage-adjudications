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

export default {
  stubGetNeurodiversities,
}
