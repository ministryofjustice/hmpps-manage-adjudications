import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubGetLearnerProfile = ({
  prisonerNumber,
  response = {},
}: {
  prisonerNumber: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/curious/learnerProfile/${prisonerNumber}`,
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
  stubGetLearnerProfile,
}
