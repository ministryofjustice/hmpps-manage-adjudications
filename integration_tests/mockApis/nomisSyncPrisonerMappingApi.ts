import { SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'
import { NomisSyncMapLocation } from '../../server/data/PrisonLocationResult'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/nomisSyncPrisonerMappingApi/health/ping',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubGetDpsLocationId = ({
  nomisLocationId = 25538,
  response = { dpsLocationId: 'location-1' },
}: {
  nomisLocationId: number
  response: NomisSyncMapLocation
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/nomisSyncPrisonerMappingApi/api/locations/nomis/${nomisLocationId}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

const stubGetNomisLocationId = ({
  dpsLocationId = 'location-1',
  response = { nomisLocationId: 25538 },
}: {
  dpsLocationId: string
  response: NomisSyncMapLocation
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/nomisSyncPrisonerMappingApi/api/locations/dps/${dpsLocationId}`,
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: response,
    },
  })

export default {
  stubPing,
  stubGetDpsLocationId,
  stubGetNomisLocationId,
}
