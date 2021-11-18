import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { CaseLoad } from '../../server/data/prisonApiClient'

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

export default {
  stubPing,
  stubUserCaseloads,
  stubGetPrisonerDetails,
  stubGetLocations,
  stubGetSecondaryLanguages,
  stubGetBatchPrisonerDetails,
}
