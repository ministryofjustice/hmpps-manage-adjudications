import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { LocationsApiLocation } from '../../server/data/PrisonLocationResult'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/locationsInsidePrisonApi/health/ping',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubGetLocation = ({
  locationId = 'location-1',
  response = {
    id: 'location-1',
    prisonId: 'MDI',
    key: 'MDI-1',
    localName: 'Houseblock 1',
  },
}: {
  locationId: string
  response: LocationsApiLocation
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/locationsInsidePrisonApi/locations/${locationId}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const stubGetLocations = ({
  prisonId,
  response = [],
}: {
  prisonId: string
  response: LocationsApiLocation[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/locationsInsidePrisonApi/locations/prison/${prisonId}/non-residential-usage-type/OCCURRENCE`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8', 'Sort-Fields': 'userDescription' },
      jsonBody: response,
    },
  })

const stubGetAdjudicationLocations = ({
  prisonId,
  response = [],
}: {
  prisonId: string
  response: LocationsApiLocation[]
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/locationsInsidePrisonApi/locations/prison/${prisonId}/location-type/ADJUDICATION_ROOM`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

export default {
  stubPing,
  stubGetLocation,
  stubGetLocations,
  stubGetAdjudicationLocations,
}
