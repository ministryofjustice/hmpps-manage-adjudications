import { SuperAgentRequest } from 'superagent'
import moment from 'moment'
import { stubFor, verifyRequest } from './wiremock'
import { apiPageResponseFrom } from '../../server/test/mojPaginationUtils'
import { OffenceDetails } from '../../server/data/DraftAdjudicationResult'
import { ReportedAdjudicationStatus } from '../../server/data/ReportedAdjudicationResult'

const stubPing = (status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/adjudications/health/ping',
    },
    response: {
      status,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

const stubStartNewDraftAdjudication = (response = {}, status = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: '/adjudications/draft-adjudications',
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostDraftIncidentStatement = ({
  id,
  response = {},
}: {
  id: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/draft-adjudications/${id}/incident-statement`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPutDraftIncidentStatement = ({
  id,
  response = {},
}: {
  id: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${id}/incident-statement`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetDraftAdjudication = ({
  id,
  response = {},
}: {
  id: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/draft-adjudications/${id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubSubmitCompleteDraftAdjudication = ({
  id,
  response = {},
}: {
  id: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/draft-adjudications/${id}/complete-draft-adjudication`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubEditDraftIncidentDetails = ({
  id,
  response = {},
  status = 200,
}: {
  id: number
  response: Record<string, unknown>
  status: number
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${id}/incident-details`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetReportedAdjudication = ({
  id,
  response = {},
}: {
  id: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/reported-adjudications/${id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetAllDraftAdjudicationsForUser = (response = {}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/draft-adjudications/my/agency/MDI`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetReportedAdjudications =
  (prefix: string) =>
  ({
    agencyId = 'MDI',
    number = 0,
    size = 20,
    allContent = [],
    filter = { status: null, toDate: moment().format('YYYY-MM-DD'), fromDate: moment().format('YYYY-MM-DD') },
  }: {
    agencyId: string
    number: number
    size: number
    allContent: unknown[]
    filter: {
      status: ReportedAdjudicationStatus
      fromDate: string
      toDate: string
    }
  }): SuperAgentRequest => {
    const apiRequest = {
      size,
      number,
    }
    const apiResponse = apiPageResponseFrom(apiRequest, allContent)
    const path =
      `${prefix}agency/${agencyId}?page=${number}&size=${size}` +
      `${(filter.fromDate && `&startDate=${filter.fromDate}`) || ''}` +
      `${(filter.toDate && `&endDate=${filter.toDate}`) || ''}` +
      `${(filter.status && `&status=${filter.status}`) || ''}`
    return stubFor({
      request: {
        method: 'GET',
        url: path,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: apiResponse,
      },
    })
  }

const stubGetAllReportedAdjudications = stubGetReportedAdjudications('/adjudications/reported-adjudications/')

const stubGetYourReportedAdjudications = stubGetReportedAdjudications('/adjudications/reported-adjudications/my/')

const stubCreateDraftFromCompleteAdjudication = ({
  adjudicationNumber,
  response = {},
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/create-draft-adjudication`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetOffenceRule = ({
  offenceCode,
  response = {},
}: {
  offenceCode: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/draft-adjudications/offence-rule/${offenceCode}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const verifySaveOffenceDetails = ({
  adjudicationNumber,
  offenceDetails,
}: {
  adjudicationNumber: number
  offenceDetails: OffenceDetails[]
}) =>
  verifyRequest({
    requestUrlPattern: `/adjudications/draft-adjudications/${adjudicationNumber}/offence-details`,
    method: 'PUT',
    body: {
      offenceDetails,
    },
  })

export default {
  stubPing,
  stubStartNewDraftAdjudication,
  stubPostDraftIncidentStatement,
  stubPutDraftIncidentStatement,
  stubGetDraftAdjudication,
  stubSubmitCompleteDraftAdjudication,
  stubEditDraftIncidentDetails,
  stubGetReportedAdjudication,
  stubGetAllDraftAdjudicationsForUser,
  stubGetYourReportedAdjudications,
  stubGetAllReportedAdjudications,
  stubCreateDraftFromCompleteAdjudication,
  stubGetOffenceRule,
  verifySaveOffenceDetails,
}
