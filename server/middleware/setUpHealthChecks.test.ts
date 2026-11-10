import { endpointHealthComponent, monitoringMiddleware } from '@ministryofjustice/hmpps-monitoring'
import setUpHealthChecks from './setUpHealthChecks'
import config from '../config'
import type { ApplicationInfo } from '../applicationInfo'

jest.mock('@ministryofjustice/hmpps-monitoring', () => ({
  endpointHealthComponent: jest.fn((_logger, name) => ({ name })),
  monitoringMiddleware: jest.fn(() => ({ health: jest.fn(), info: jest.fn(), ping: jest.fn() })),
}))

const applicationInfo = {} as ApplicationInfo

describe('setUpHealthChecks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setUpHealthChecks(applicationInfo)
  })

  const checkedApis = () => (endpointHealthComponent as jest.Mock).mock.calls.map(([, name]) => name)

  it('does not check Curious, which is optional', () => {
    expect(checkedApis()).not.toContain('curious')
  })

  it('checks every other configured API', () => {
    const expected = Object.keys(config.apis).filter(name => name !== 'curious')
    expect(checkedApis()).toEqual(expected)
    expect(monitoringMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({ healthComponents: expected.map(name => ({ name })) }),
    )
  })
})
