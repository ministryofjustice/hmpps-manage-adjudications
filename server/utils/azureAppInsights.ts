import { setup, defaultClient, TelemetryClient, DistributedTracingModes } from 'applicationinsights'
import type { TelemetryItem } from 'applicationinsights/out/src/declarations/generated'
import type { ApplicationInfo } from '../applicationInfo'

export type ContextObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [name: string]: any
}

export function initialiseAppInsights(): void {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

export function buildAppInsightsClient(
  { applicationName, buildNumber }: ApplicationInfo,
  overrideName?: string,
): TelemetryClient {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    defaultClient.context.tags['ai.cloud.role'] = overrideName || applicationName
    defaultClient.context.tags['ai.application.ver'] = buildNumber
    defaultClient.addTelemetryProcessor(addUserDataToRequests)
    return defaultClient
  }
  return null
}

export function addUserDataToRequests(envelope: TelemetryItem, contextObjects: ContextObject) {
  const isRequest = envelope.data?.baseType === 'RequestData'
  if (isRequest) {
    const { username, activeCaseLoadId, meta } = contextObjects?.['http.ServerRequest']?.res?.locals?.user || {}
    if (username) {
      const { properties } = envelope.data.baseData
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = {
        username,
        activeCaseLoadId,
        meta,
        ...properties,
      }
    }
  }
  return true
}
