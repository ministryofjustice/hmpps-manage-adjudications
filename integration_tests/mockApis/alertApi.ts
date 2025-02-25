import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { alertCodeString } from '../../server/utils/alertHelper'

const stubGetPrisonersAlerts = ({ prisonerNumber, response = [], status = 200 }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/alertsApi/prisoners/${prisonerNumber}/alerts?alertCode=${alertCodeString}`,
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

export default {
  stubGetPrisonersAlerts,
}
