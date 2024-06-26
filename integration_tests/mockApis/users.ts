import { Response, SuperAgentRequest } from 'superagent'
import { stubFor } from './wiremock'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/users/health/ping',
    },
    response: {
      status,
    },
  })

const stubUser = ({ username = 'USER1', activeCaseLoadId = 'MDI' }: { username?: string; activeCaseLoadId?: string }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/users/users/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        staffId: 231232,
        username,
        active: true,
        name: 'john smith',
        activeCaseLoadId,
        meta: {
          caseLoadId: activeCaseLoadId,
          description: 'Moorland (HMP & YOI)',
          type: 'INST',
          caseloadFunction: 'TEST',
          currentlyActive: true,
        },
      },
    },
  })

const stubGetUser = ({ username, response }: { username: string; response: { username; name } }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/users/users/${username}`,
    },
    response: {
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      status: 200,
      jsonBody: response,
    },
  })

const stubGetUserFromUsername = ({
  username,
  response = {},
}: {
  username: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: `/users/users/${username}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetUserFromNames = ({
  staffFirstName,
  staffLastName,
  response = {},
}: {
  staffFirstName: string
  staffLastName: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/users/users/search?name=${staffFirstName}%20${staffLastName}&authSources=nomis`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        content: response,
      },
    },
  })

const stubGetEmail = ({
  username,
  response = {},
}: {
  username: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/users/users/${username}/email`,
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
  stubAuthUser: (args?: { username?: string; activeCaseLoadId?: string }): Promise<Response> =>
    stubUser({ username: args?.username, activeCaseLoadId: args?.activeCaseLoadId }),
  stubUserOriginatingAgency: (activeCaseLoadId: string): Promise<Response> => stubUser({ activeCaseLoadId }),
  stubGetUserFromUsername,
  stubGetUser,
  stubGetUserFromNames,
  stubGetEmail,
}
