import { serviceCheckFactory } from '../data/healthCheck'
import config from '../config'
import type { AgentConfig } from '../config'
import type { ApplicationInfo } from '../applicationInfo'

interface HealthCheckStatus {
  name: string
  status: string
  message: unknown
}

interface HealthCheckResult extends Record<string, unknown> {
  healthy: boolean
  checks: Record<string, unknown>
}

export type HealthCheckService = () => Promise<HealthCheckStatus>
export type HealthCheckCallback = (result: HealthCheckResult) => void

function service(name: string, url: string, agentConfig: AgentConfig): HealthCheckService {
  const check = serviceCheckFactory(name, url, agentConfig)
  return () =>
    check()
      .then(result => ({ name, status: 'ok', message: result }))
      .catch(err => ({ name, status: 'ERROR', message: err }))
}

function addAppInfo(result: HealthCheckResult, applicationInfo: ApplicationInfo): HealthCheckResult {
  const buildInfo = {
    uptime: process.uptime(),
    build: {
      buildNumber: applicationInfo.buildNumber,
      gitRef: applicationInfo.gitRef,
    },
    version: applicationInfo.buildNumber,
  }

  return { ...result, ...buildInfo }
}

function gatherCheckInfo(aggregateStatus: Record<string, unknown>, currentStatus: HealthCheckStatus) {
  return { ...aggregateStatus, [currentStatus.name]: currentStatus.message }
}

const apiChecks = [
  service('hmppsAuth', `${config.apis.hmppsAuth.url}/health/ping`, config.apis.hmppsAuth.agent),
  service('hmppsManageUsers', `${config.apis.hmppsManageUsers.url}/health/ping`, config.apis.hmppsManageUsers.agent),
  service('prisonerSearch', `${config.apis.prisonerSearch.url}/health/ping`, config.apis.prisonerSearch.agent),
  service('prisonApi', `${config.apis.prison.url}/health/ping`, config.apis.prison.agent),
  service('adjudications', `${config.apis.adjudications.url}/health/ping`, config.apis.adjudications.agent),
  service(
    'locationsInsidePrisonApi',
    `${config.apis.locationsInsidePrison.url}/health/ping`,
    config.apis.locationsInsidePrison.agent
  ),
  service(
    'nomisSyncPrisonerMappingApi',
    `${config.apis.nomisSyncPrisonerMapping.url}/health/ping`,
    config.apis.nomisSyncPrisonerMapping.agent
  ),

  ...(config.apis.tokenVerification.enabled
    ? [
        service(
          'tokenVerification',
          `${config.apis.tokenVerification.url}/health/ping`,
          config.apis.tokenVerification.agent
        ),
      ]
    : []),
]

export default function healthCheck(
  applicationInfo: ApplicationInfo,
  callback: HealthCheckCallback,
  checks = apiChecks
): void {
  Promise.all(checks.map(fn => fn())).then(checkResults => {
    const allOk = checkResults.every(item => item.status === 'ok')

    const result = {
      healthy: allOk,
      checks: checkResults.reduce(gatherCheckInfo, {}),
    }

    callback(addAppInfo(result, applicationInfo))
  })
}
