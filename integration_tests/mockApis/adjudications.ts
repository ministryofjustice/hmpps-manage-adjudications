import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/adjudications/health/ping',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubStartNewDraftAdjudication = (response = {}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: '/adjudications/draft-adjudications',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostDraftIncidentStatement = ({
  id,
  response = {},
}: {
  id: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/draft-adjudications/${id}/incident-statement`,
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
  stubPing,
  stubStartNewDraftAdjudication,
  stubPostDraftIncidentStatement,
}
