const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  maxSockets: 100

  maxFreeSockets: 10

  freeSocketTimeout: 30000
}

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  buildNumber: get('BUILD_NUMBER', '1_0_0', requiredInProduction),
  gitRef: get('GIT_REF', 'xxxxxxxxxxxxxxxxxxx', requiredInProduction),
  https: production,
  staticResourceCacheDuration: 20,
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    gotenberg: {
      apiUrl: get('GOTENBERG_API_URL', 'http://localhost:3001', requiredInProduction),
      pdfMargins: {
        marginTop: '1.0',
        marginBottom: '0.8',
        marginLeft: '0.0',
        marginRight: '0.0',
      },
      adjudicationsUrl: get('ADJUDICATIONS_URL', 'http://host.docker.internal:3000', requiredInProduction),
    },
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
      apiClientId: get('API_CLIENT_ID', 'manage-adjudications', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'manage-adjudications-client', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    hmppsManageUsers: {
      url: get('HMPPS_MANAGE_USERS_API_URL', 'http://localhost:8080', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_USERS_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('MANAGE_USERS_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    prison: {
      url: get('PRISON_API_URL', 'http://localhost:8080', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('PRISON_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    dataInsights: {
      url: get('DATA_INSIGHTS_API_URL', 'http://localhost:8080', requiredInProduction),
      timeout: {
        response: Number(get('DATA_INSIGHTS_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('DATA_INSIGHTS_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    prisonerSearch: {
      url: get('PRISONER_SEARCH_API_URL', 'http://localhost:8083', requiredInProduction),
      timeout: {
        response: Number(get('PRISONER_SEARCH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('PRISONER_SEARCH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    adjudications: {
      url: get('MANAGE_ADJUDICATIONS_API_URL', 'http://localhost:3003', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_ADJUDICATIONS_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('MANAGE_ADJUDICATIONS_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    curious: {
      url: get('CURIOUS_API_URL', 'http://localhost:3004', requiredInProduction),
      timeout: {
        response: Number(get('CURIOUS_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('CURIOUS_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
  },
  analytics: {
    tagManagerContainerId: get('TAG_MANAGER_CONTAINER_ID', ''),
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  digitalPrisonServiceUrl: get('DIGITAL_PRISON_SERVICE_URL', 'http://localhost:3002', requiredInProduction),
  supportUrl: get('SUPPORT_URL', 'http://localhost:3003', requiredInProduction),
  maintenanceModeFlag: get('MAINTENANCE_MODE', false, requiredInProduction),
  formsTabFlag: get('FORMS_TAB_FLAG', false, requiredInProduction),
  automaticPunishmentDatesFlag: get('AUTOMATIC_PUNISHMENT_DATES_FLAG', false, requiredInProduction),
}
