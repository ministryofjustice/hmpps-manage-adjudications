import superagent, { type SuperAgentRequest, type Response } from 'superagent'

const url = 'http://localhost:9091/__admin'

/**
 * Incomplete definition of options used for creating a new stub mapping
 * https://wiremock.org/docs/standalone/admin-api-reference/#tag/Stub-Mappings/operation/createNewStubMapping
 */
interface Mapping {
  request?: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
    queryParameters?: Record<string, { equalTo: string } | { matches: string }>
    bodyPatterns?: ({ contains: string } | { equalToJson: unknown })[]
  } & ({ url?: string } | { urlPath: string } | { urlPathPattern: string } | { urlPattern: string })
  response?: {
    status?: number
    headers?: Record<string, string>
  } & ({ jsonBody?: unknown } | { body: string } | { base64Body: string })
}

export const getRequests = (): SuperAgentRequest => superagent.get(`${url}/requests`)

export const stubFor = (mapping: Mapping): SuperAgentRequest => superagent.post(`${url}/mappings`).send(mapping)

export const stubPing = (urlPrefix: string, httpStatus = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPath: `${urlPrefix}/health/ping`,
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

/**
 * Incomplete definition of options used for searching requests
 * https://wiremock.org/docs/standalone/admin-api-reference/#tag/Requests/operation/findRequestsByCriteria
 */
type FindRequestCriteria = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
} & ({ url?: string } | { urlPath: string } | { urlPathPattern: string } | { urlPattern: string })

/**
 * Incomplete definition of requests found
 * https://wiremock.org/docs/standalone/admin-api-reference/#tag/Requests/operation/findRequestsByCriteria
 */
interface FoundRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  url: string
  absoluteUrl: string
  headers: Record<string, string>
  queryParams: Record<string, { key: string; values: string[] }>
  body: string
  bodyAsBase64: string
}

export const getMatchingRequests = (body: FindRequestCriteria): Promise<FoundRequest[]> =>
  superagent
    .post(`${url}/requests/find`)
    .send(body)
    .then(data => data.body.requests)

/**
 * Audit events sent to the stubbed SQS endpoint for one page, oldest first.
 *
 * Events are identified by their SQS SendMessage payload and filtered by page url, so that
 * unrelated requests and other pages visited on the way (e.g. after signing in) cannot shift the results.
 *
 * The app sends them fire-and-forget – and the access attempt only once the response has
 * closed – so this waits for `expectedCount` of them to arrive before returning.
 */
export const getSentAuditEvents = async ({
  pageUrl,
  expectedCount = 0,
}: {
  pageUrl: string
  expectedCount?: number
}): Promise<unknown[]> => {
  const readSentEvents = async (): Promise<unknown[]> => {
    const requests = await getMatchingRequests({ method: 'POST', urlPath: '/' })
    return requests
      .filter(({ body }) => body?.includes('MessageBody'))
      .map(({ body }) => JSON.parse(JSON.parse(body).MessageBody))
      .filter(event => JSON.parse(event.details ?? '{}').pageUrl === pageUrl)
      .map(event => {
        // vary per run, so cannot be asserted on
        const sentEvent = { ...event }
        delete sentEvent.correlationId
        delete sentEvent.when
        return sentEvent
      })
  }

  const waitForEvents = async (attemptsLeft: number): Promise<unknown[]> => {
    const events = await readSentEvents()
    if (events.length >= expectedCount || attemptsLeft <= 0) {
      return events
    }
    await new Promise(resolve => {
      setTimeout(resolve, 50)
    })
    return waitForEvents(attemptsLeft - 1)
  }

  return waitForEvents(100)
}

export const resetStubs = (): Promise<Response[]> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

export const verifyRequest = ({
  requestUrl,
  requestUrlPattern,
  method,
  body,
  queryParameters,
}: {
  requestUrl?: string
  requestUrlPattern?: string
  method: string
  body?: unknown
  queryParameters?: unknown
}): SuperAgentRequest => {
  const bodyPatterns =
    (body && {
      bodyPatterns: [{ equalToJson: JSON.stringify(body) }],
    }) ||
    {}
  return superagent.post(`${url}/requests/count`).send({
    method,
    urlPattern: requestUrlPattern,
    url: requestUrl,
    ...bodyPatterns,
    queryParameters,
  })
}
