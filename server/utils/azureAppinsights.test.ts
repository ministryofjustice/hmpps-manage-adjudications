import { initialiseTelemetry, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import type { TelemetryBuilder } from '@ministryofjustice/hmpps-azure-telemetry'
import './azureAppInsights'

jest.mock('@ministryofjustice/hmpps-azure-telemetry', () => {
  const builder = {
    addFilter: jest.fn(),
    addModifier: jest.fn(),
    startRecording: jest.fn(),
  }
  builder.addFilter.mockReturnValue(builder)
  builder.addModifier.mockReturnValue(builder)

  return {
    flushTelemetry: jest.fn(),
    initialiseTelemetry: jest.fn().mockReturnValue(builder),
    telemetry: {
      processors: {
        filterSpanWherePath: jest.fn().mockReturnValue('filter'),
        enrichSpanNameWithHttpRoute: jest.fn().mockReturnValue('modifier'),
      },
    },
  }
})

describe('azure application insights', () => {
  const mockedInitialiseTelemetry = jest.mocked(initialiseTelemetry)
  const mockedFilterSpanWherePath = jest.mocked(telemetry.processors.filterSpanWherePath)
  const mockedEnrichSpanNameWithHttpRoute = jest.mocked(telemetry.processors.enrichSpanNameWithHttpRoute)
  const builder = mockedInitialiseTelemetry.mock.results[0].value as jest.Mocked<TelemetryBuilder>

  it('sets the service resource before telemetry starts recording', () => {
    expect(mockedInitialiseTelemetry).toHaveBeenCalledWith({
      serviceName: 'hmpps-manage-adjudications',
      serviceVersion: process.env.BUILD_NUMBER || 'unknown',
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      debug: process.env.DEBUG_TELEMETRY === 'true',
    })
    expect(builder.startRecording).toHaveBeenCalledTimes(1)
    expect(mockedInitialiseTelemetry.mock.invocationCallOrder[0]).toBeLessThan(
      builder.startRecording.mock.invocationCallOrder[0],
    )
  })

  it('filters noise and enriches request span names', () => {
    expect(mockedFilterSpanWherePath).toHaveBeenCalledWith(['/health', '/ping', '/info', '/assets/*', '/favicon.ico'])
    expect(builder.addFilter).toHaveBeenCalledWith('filter')
    expect(mockedEnrichSpanNameWithHttpRoute).toHaveBeenCalledTimes(1)
    expect(builder.addModifier).toHaveBeenCalledWith('modifier')
  })
})
