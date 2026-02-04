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
      url: `/locationsInsidePrisonApi/locations/${locationId}?formatLocalName=true`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const stubGetLocationWithUuid = ({
  locationId = '0194ac90-2def-7c63-9f46-b3ccc911fdff',
  response = {
    id: '0194ac90-2def-7c63-9f46-b3ccc911fdff',
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
      url: `/locationsInsidePrisonApi/locations/${locationId}?formatLocalName=true`,
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
      url: `/locationsInsidePrisonApi/locations/non-residential/prison/${prisonId}/service/LOCATION_OF_INCIDENT?formatLocalName=true&sortByLocalName=true`,
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
      url: `/locationsInsidePrisonApi/locations/non-residential/prison/${prisonId}/service/HEARING_LOCATION?formatLocalName=true&sortByLocalName=true`,
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
  stubGetLocationWithUuid,
  stubGetLocations,
  stubGetAdjudicationLocations,
}
