import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/prisonApiClient'

const stubUserCaseloads = (caseloads: CaseLoad[]): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: '/prisonApi/api/users/me/caseLoads',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: caseloads || [
        {
          caseLoadId: 'MDI',
          description: 'Moorland',
          currentlyActive: true,
        },
      ],
    },
  })

const stubGetPrisonerDetails = ({
  prisonerNumber,
  response = {},
}: {
  prisonerNumber: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/offenders/${prisonerNumber}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: Response,
    },
  })

export default {
  stubUserCaseloads,
  stubGetPrisonerDetails,
}
