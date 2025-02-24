import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/prisonApiClient'
import { Agency } from '../../server/data/PrisonLocationResult'
import { alertCodeString } from '../../server/utils/alertHelper'

const stubGetPrisonersAlerts = ({ prisonerNumber, response = [], status = 200 }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/offenders/${prisonerNumber}/alerts?alertCode=${alertCodeString}`,
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
