import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/prisonApiClient'
import { Agency } from '../../server/data/PrisonLocationResult'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisonApi/health/ping',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

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
      jsonBody: response,
    },
  })

const stubGetAgency = ({ agencyId, response }: { agencyId: string; response: Agency }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/agencies/${agencyId}?activeOnly=false`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 200,
      jsonBody: response,
    },
  })

const stubGetSecondaryLanguages = ({
  bookingId,
  response = [],
}: {
  bookingId: number
  response: Record<string, unknown>[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/bookings/${bookingId}/secondary-languages`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Sort-Fields': 'userDescription' },
      jsonBody: response,
    },
  })

const stubGetBatchPrisonerDetails = (response = []): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/prisonApi/api/bookings/offenders?activeOnly=false`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const stubGetUsersLocations = (response = []): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/users/me/locations`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const stubGetMovementByOffender = ({ response = [], status = 200 }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/prisonApi/api/movements/offenders?movementType=ADM&latestOnly=false&allBookings=false`,
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const stubValidateChargeNumber = ({
  chargeNumber,
  sanctionStatus,
  offenderNo,
  responseBody = {},
  status = 200,
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/adjudications/adjudication/${chargeNumber}/sanction/${sanctionStatus}/${offenderNo}/validate`,
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: responseBody,
    },
  })

export default {
  stubPing,
  stubUserCaseloads,
  stubGetPrisonerDetails,
  stubGetAgency,
  stubGetSecondaryLanguages,
  stubGetBatchPrisonerDetails,
  stubGetUsersLocations,
  stubGetMovementByOffender,
  stubValidateChargeNumber,
}
