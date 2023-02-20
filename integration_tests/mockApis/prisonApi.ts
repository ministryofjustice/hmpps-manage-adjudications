import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/prisonApiClient'
import { Location, Agency } from '../../server/data/PrisonLocationResult'
import { alertCodeString } from '../../server/utils/alertHelper'

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

const stubGetLocations = ({
  agencyId,
  response = [],
}: {
  agencyId: string
  response: Record<string, unknown>[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/agencies/${agencyId}/locations?eventType=OCCUR`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Sort-Fields': 'userDescription' },
      jsonBody: response,
    },
  })

const stubGetLocationsByType = ({
  agencyId,
  response = [],
}: {
  agencyId: string
  response: Record<string, unknown>[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/agencies/${agencyId}/locations/type/ADJU`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const stubGetLocation = ({ locationId, response }: { locationId: number; response: Location }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/locations/${locationId}`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 200,
      jsonBody: response,
    },
  })

const stubGetAgency = ({ agencyId, response }: { agencyId: number; response: Agency }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/agencies/${agencyId}`,
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

const stubGetPrisonersAlerts = ({ prisonerNumber, response = [], status = 200 }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/prisonApi/api/offenders/${prisonerNumber}/alerts/v2?alertCodes=${alertCodeString}`,
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

export default {
  stubPing,
  stubUserCaseloads,
  stubGetPrisonerDetails,
  stubGetLocations,
  stubGetLocationsByType,
  stubGetLocation,
  stubGetAgency,
  stubGetSecondaryLanguages,
  stubGetBatchPrisonerDetails,
  stubGetUsersLocations,
  stubGetPrisonersAlerts,
}
