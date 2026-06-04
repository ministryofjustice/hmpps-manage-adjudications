import { defaultClient, DistributedTracingModes, setup } from 'applicationinsights'
import type { TelemetryItem } from 'applicationinsights/out/src/declarations/generated'
import { addUserDataToRequests, buildAppInsightsClient, ContextObject, initialiseAppInsights } from './azureAppInsights'
import { ActiveCaseLoad } from '../@types/template'
import type { ApplicationInfo } from '../applicationInfo'
import config from '../config'

jest.mock('applicationinsights', () => ({
  setup: jest.fn(),
  defaultClient: {
    context: { tags: {} },
    addTelemetryProcessor: jest.fn(),
  },
  DistributedTracingModes: { AI_AND_W3C: 'AI_AND_W3C' },
}))

const mockedSetup = jest.mocked(setup)
const mockedDefaultClient = defaultClient as unknown as {
  context: { tags: Record<string, string> }
  addTelemetryProcessor: jest.Mock
}

const user = {
  activeCaseLoadId: 'LII',
  username: 'test-user',
  meta: {
    caseLoadId: 'LII',
  } as ActiveCaseLoad,
}

const createEnvelope = (properties: Record<string, string | boolean>, baseType = 'RequestData') =>
  ({
    name: 'Microsoft.ApplicationInsights.Request',
    time: new Date(),
    data: {
      baseType,
      baseData: { properties },
    },
  }) as TelemetryItem

const createContext = (username: string, activeCaseLoadId: string) =>
  ({
    'http.ServerRequest': {
      res: {
        locals: {
          user: {
            username,
            activeCaseLoadId,
            meta: {
              caseLoadId: activeCaseLoadId,
            },
          },
        },
      },
    },
  }) as ContextObject

const context = createContext(user.username, user.activeCaseLoadId)

describe('azure-appinsights', () => {
  const applicationInfo: ApplicationInfo = {
    applicationName: 'hmpps-manage-adjudications',
    buildNumber: config.buildNumber as string,
    gitRef: config.gitRef as string,
    gitShortHash: (config.gitRef as string).substring(0, 7),
    productId: config.productId,
    branchName: config.branchName as string,
  }
  const originalConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  let mockStart: jest.Mock
  let mockSetDistributedTracingMode: jest.Mock
  let consoleLogSpy: jest.SpyInstance

  beforeEach(() => {
    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING

    mockStart = jest.fn()
    mockSetDistributedTracingMode = jest.fn().mockReturnValue({ start: mockStart })
    mockedSetup.mockReset()
    mockedSetup.mockReturnValue({
      setDistributedTracingMode: mockSetDistributedTracingMode,
    } as unknown as ReturnType<typeof setup>)

    mockedDefaultClient.context.tags = {}
    mockedDefaultClient.addTelemetryProcessor.mockReset()

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    if (originalConnectionString) {
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = originalConnectionString
    } else {
      delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    }
    consoleLogSpy.mockRestore()
  })

  describe('initialiseAppInsights', () => {
    it('does not initialise application insights when no connection string is set', () => {
      initialiseAppInsights()

      expect(mockedSetup).not.toHaveBeenCalled()
      expect(mockSetDistributedTracingMode).not.toHaveBeenCalled()
      expect(mockStart).not.toHaveBeenCalled()
    })

    it('starts application insights with AI and W3C distributed tracing when a connection string is set', () => {
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'InstrumentationKey=test'

      initialiseAppInsights()

      expect(mockedSetup).toHaveBeenCalledTimes(1)
      expect(mockSetDistributedTracingMode).toHaveBeenCalledWith(DistributedTracingModes.AI_AND_W3C)
      expect(mockStart).toHaveBeenCalledTimes(1)
    })
  })

  describe('buildAppInsightsClient', () => {
    it('returns null when no connection string is set', () => {
      const client = buildAppInsightsClient(applicationInfo)

      expect(client).toBeNull()
      expect(mockedDefaultClient.context.tags).toEqual({})
      expect(mockedDefaultClient.addTelemetryProcessor).not.toHaveBeenCalled()
    })

    it('sets application tags and registers user data telemetry processor when enabled', () => {
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'InstrumentationKey=test'

      const client = buildAppInsightsClient(applicationInfo)

      expect(client).toBe(defaultClient)
      expect(mockedDefaultClient.context.tags).toMatchObject({
        'ai.cloud.role': applicationInfo.applicationName,
        'ai.application.ver': applicationInfo.buildNumber,
      })
      expect(mockedDefaultClient.addTelemetryProcessor).toHaveBeenCalledWith(addUserDataToRequests)
    })

    it('uses the override name as the cloud role when provided', () => {
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING = 'InstrumentationKey=test'

      buildAppInsightsClient(applicationInfo, 'override-service-name')

      expect(mockedDefaultClient.context.tags['ai.cloud.role']).toEqual('override-service-name')
      expect(mockedDefaultClient.context.tags['ai.application.ver']).toEqual(applicationInfo.buildNumber)
    })
  })

  describe('addUserDataToRequests', () => {
    it('adds user data to properties when present', () => {
      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, context)

      expect(envelope.data.baseData.properties).toStrictEqual({
        ...user,
        other: 'things',
      })
    })

    it('handles absent user data', () => {
      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, createContext(undefined, user.activeCaseLoadId))

      expect(envelope.data.baseData.properties).toStrictEqual({ other: 'things' })
    })

    it('returns true when not RequestData type', () => {
      const envelope = createEnvelope({}, 'NOT_REQUEST_DATA')

      const response = addUserDataToRequests(envelope, context)

      expect(response).toStrictEqual(true)
    })

    it('handles when no properties have been set', () => {
      const envelope = createEnvelope(undefined)

      addUserDataToRequests(envelope, context)

      expect(envelope.data.baseData.properties).toStrictEqual(user)
    })

    it('handles missing user details', () => {
      const envelope = createEnvelope({ other: 'things' })

      addUserDataToRequests(envelope, {
        'http.ServerRequest': {},
      } as ContextObject)

      expect(envelope.data.baseData.properties).toEqual({
        other: 'things',
      })
    })
  })
})
