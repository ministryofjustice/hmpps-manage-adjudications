import superagent, { SuperAgentRequest, Response } from 'superagent'

const url = 'http://localhost:9091/__admin'

const stubFor = (mapping: Record<string, unknown>): SuperAgentRequest =>
  superagent.post(`${url}/mappings`).send(mapping)

const getRequests = (): SuperAgentRequest => superagent.get(`${url}/requests`)

const resetStubs = (): Promise<Array<Response>> =>
  Promise.all([superagent.delete(`${url}/mappings`), superagent.delete(`${url}/requests`)])

const verifyRequest = ({
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
}) => {
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

export { stubFor, getRequests, resetStubs, verifyRequest }
