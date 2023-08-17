import { SuperAgentRequest } from 'superagent'
import moment from 'moment'
import { stubFor, verifyRequest } from './wiremock'
import { apiPageResponseFrom } from '../../server/test/mojPaginationUtils'
import { OffenceDetails, PrisonerGender } from '../../server/data/DraftAdjudicationResult'
import {
  allIssueStatuses,
  allStatuses,
  IssueStatus,
  ReportedAdjudicationStatus,
} from '../../server/data/ReportedAdjudicationResult'

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

const stubUpdateDraftIncidentRole = ({
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
      url: `/adjudications/draft-adjudications/${id}/incident-role`,
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
      url: `/adjudications/reported-adjudications/${id}/v2`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetAllDraftAdjudicationsForUser = ({
  number = 0,
  size = 20,
  allContent = [],
  filter = {
    toDate: moment().format('YYYY-MM-DD'),
    fromDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
  },
}: {
  number: number
  size: number
  allContent: unknown[]
  filter: {
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
    `/adjudications/draft-adjudications/my-reports?page=${number}&size=${size}` +
    `${(filter.fromDate && `&startDate=${filter.fromDate}`) || ''}` +
    `${(filter.toDate && `&endDate=${filter.toDate}`) || ''}`
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

const stubGetReportedAdjudications =
  (prefix: string) =>
  ({
    number = 0,
    size = 20,
    allContent = [],
    filter = {
      status: null,
      toDate: moment().format('YYYY-MM-DD'),
      fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
      transfersOnly: false,
    },
  }: {
    number: number
    size: number
    allContent: unknown[]
    filter: {
      status: ReportedAdjudicationStatus
      fromDate?: string
      toDate?: string
      transfersOnly?: boolean
    }
  }): SuperAgentRequest => {
    const apiRequest = {
      size,
      number,
    }
    const apiResponse = apiPageResponseFrom(apiRequest, allContent)
    const path =
      `${prefix}?page=${number}&size=${size}` +
      `${(filter.fromDate && `&startDate=${filter.fromDate}`) || ''}` +
      `${(filter.toDate && `&endDate=${filter.toDate}`) || ''}` +
      `${(filter.status && `&status=${filter.status}`) || `&status=${allStatuses}`}` +
      `${(filter.transfersOnly && `&transfersOnly=${filter.transfersOnly}`) || ''}`
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

const stubGetAllReportedAdjudications = stubGetReportedAdjudications('/adjudications/reported-adjudications/reports')

const stubGetYourReportedAdjudications = stubGetReportedAdjudications(
  '/adjudications/reported-adjudications/my-reports'
)

const stubCreateDraftFromCompleteAdjudication = ({
  chargeNumber,
  response = {},
}: {
  chargeNumber: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/create-draft-adjudication`,
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
  isYouthOffender = false,
  gender = PrisonerGender.MALE,
  response = {},
}: {
  offenceCode: number
  isYouthOffender: boolean
  gender: PrisonerGender
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/draft-adjudications/offence-rule/${offenceCode}?youthOffender=${isYouthOffender}&gender=${gender}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubSaveOffenceDetails = ({
  draftId,
  response = {},
}: {
  draftId: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${draftId}/offence-details`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAloAmendOffenceDetails = ({
  draftId,
  response = {},
}: {
  draftId: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/draft-adjudications/${draftId}/alo-offence-details`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubSaveEvidenceDetails = ({
  chargeNumber,
  response = {},
}: {
  chargeNumber: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${chargeNumber}/evidence`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubSaveWitnessDetails = ({
  chargeNumber,
  response = {},
}: {
  chargeNumber: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${chargeNumber}/witnesses`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const verifySaveOffenceDetails = ({ draftId, offenceDetails }: { draftId: number; offenceDetails: OffenceDetails }) =>
  verifyRequest({
    requestUrlPattern: `/adjudications/draft-adjudications/${draftId}/offence-details`,
    method: 'PUT',
    body: {
      offenceDetails,
    },
  })

const stubUpdateAdjudicationStatus = ({
  chargeNumber,
  response,
}: {
  chargeNumber: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${chargeNumber}/status`,
    },
    response,
  })

const stubSaveYouthOffenderStatus = ({
  id,
  response = {},
}: {
  id: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${id}/applicable-rules`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubSaveAssociatedPrisoner = ({ draftId, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${draftId}/associated-prisoner`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCancelHearingV1 = ({
  chargeNumber,
  response = {},
}: {
  chargeNumber: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCancelHearing = ({
  chargeNumber,
  response = {},
}: {
  chargeNumber: string
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing/v2`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCancelCompleteHearingOutcome = ({
  chargeNumber,
  response = {},
}: {
  chargeNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${chargeNumber}/remove-completed-hearing`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubScheduleHearing = ({ chargeNumber, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing/v2`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubScheduleHearingV1 = ({ chargeNumber, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendHearingV1 = ({ chargeNumber, hearingId, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing/${hearingId}`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendHearing = ({ chargeNumber, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing/v2`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetHearingsGivenAgencyAndDate = ({ hearingDate, status = 200, response = {} }): SuperAgentRequest => {
  const today = moment().format('YYYY-MM-DD')
  const url = `/adjudications/reported-adjudications/hearings`
  const path = `${url}?hearingDate=${hearingDate || today}`
  return stubFor({
    request: {
      method: 'GET',
      url: path,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })
}

const stubAmendPrisonerGender = ({ draftId, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${draftId}/gender`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetIssueDataFilteredOnDiscDate = ({
  filter = {
    fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'),
  },
  response,
}: {
  filter: {
    fromDate: string
    toDate: string
  }
  response
}): SuperAgentRequest => {
  const path =
    `/adjudications/reported-adjudications/for-issue?` +
    `${(filter.fromDate && `startDate=${filter.fromDate}`) || ''}` +
    `${(filter.toDate && `&endDate=${filter.toDate}`) || ''}`
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
      jsonBody: response,
    },
  })
}

const stubGetIssueDataFilteredOnHearingDate = ({
  filter = {
    fromDate: moment().format('YYYY-MM-DD'),
    toDate: moment().add(2, 'days').format('YYYY-MM-DD'),
    issueStatus: allIssueStatuses,
  },
  response,
}: {
  filter: {
    fromDate: string
    toDate: string
    issueStatus: IssueStatus[]
  }
  response
}): SuperAgentRequest => {
  const path =
    `/adjudications/reported-adjudications/for-print?` +
    `${(filter.fromDate && `startDate=${filter.fromDate}`) || ''}` +
    `${(filter.toDate && `&endDate=${filter.toDate}`) || ''}` +
    `${(filter.issueStatus && `&issueStatus=${filter.issueStatus}`) || `&issueStatus=${allIssueStatuses}`}`
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
      jsonBody: response,
    },
  })
}

const stubPutDateTimeOfIssue = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${chargeNumber}/issue`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreateAdjourn = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing/outcome/adjourn`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreateReferral = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing/outcome/referral`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreatePoliceReferral = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/outcome/refer-police`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreateProsecution = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/outcome/prosecution`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreateNotProceed = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/outcome/not-proceed`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubRemoveReferral = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${chargeNumber}/remove-referral`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubRemoveNotProceedOrQuashed = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${chargeNumber}/outcome`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubRemoveAdjourn = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing/outcome/adjourn`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostCompleteDismissedHearing = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/complete-hearing/dismissed`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostCompleteHearingChargeProved = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/complete-hearing/charge-proved/v2`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostCompleteHearingNotProceed = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/complete-hearing/not-proceed`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostQuashOutcome = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/outcome/quashed`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendHearingOutcome = ({ chargeNumber, status, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${chargeNumber}/hearing/outcome/${status}/v2`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendOutcome = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${chargeNumber}/outcome`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubDeleteReport = ({ id, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
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

const stubCreatePunishments = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/punishments/v2`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendPunishments = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${chargeNumber}/punishments`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetSuspendedPunishments = ({ prisonerNumber, reportNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/reported-adjudications/punishments/${prisonerNumber}/suspended?reportNumber=${reportNumber}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetDataInsightsChart = ({ agencyId, chartName, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/api/data-insights/chart/${agencyId}/${chartName}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreatePunishmentComment = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${chargeNumber}/punishments/comment`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubEditPunishmentComment = ({ chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${chargeNumber}/punishments/comment`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubDeletePunishmentComment = ({ chargeNumber, id }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${chargeNumber}/punishments/comment/${id}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    },
  })

const stubGetAgencyReportCounts = ({ response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/reported-adjudications/report-counts`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetConsecutivePunishments = ({ prisonerNumber, punishmentType, chargeNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/reported-adjudications/punishments/${prisonerNumber}/for-consecutive?type=${punishmentType}&chargeNumber=${chargeNumber}`,
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
  stubStartNewDraftAdjudication,
  stubPostDraftIncidentStatement,
  stubPutDraftIncidentStatement,
  stubGetDraftAdjudication,
  stubSubmitCompleteDraftAdjudication,
  stubEditDraftIncidentDetails,
  stubUpdateDraftIncidentRole,
  stubGetReportedAdjudication,
  stubGetAllDraftAdjudicationsForUser,
  stubGetYourReportedAdjudications,
  stubGetAllReportedAdjudications,
  stubCreateDraftFromCompleteAdjudication,
  stubGetOffenceRule,
  stubSaveOffenceDetails,
  verifySaveOffenceDetails,
  stubUpdateAdjudicationStatus,
  stubSaveYouthOffenderStatus,
  stubSaveAssociatedPrisoner,
  stubSaveEvidenceDetails,
  stubSaveWitnessDetails,
  stubCancelHearingV1,
  stubCancelHearing,
  stubScheduleHearingV1,
  stubScheduleHearing,
  stubAmendHearingV1,
  stubAmendHearing,
  stubGetHearingsGivenAgencyAndDate,
  stubAmendPrisonerGender,
  stubGetIssueDataFilteredOnDiscDate,
  stubGetIssueDataFilteredOnHearingDate,
  stubPutDateTimeOfIssue,
  stubCreateReferral,
  stubCreateAdjourn,
  stubCreatePoliceReferral,
  stubCreateProsecution,
  stubCreateNotProceed,
  stubRemoveReferral,
  stubRemoveNotProceedOrQuashed,
  stubCancelCompleteHearingOutcome,
  stubPostCompleteDismissedHearing,
  stubPostCompleteHearingChargeProved,
  stubPostCompleteHearingNotProceed,
  stubRemoveAdjourn,
  stubPostQuashOutcome,
  stubAmendHearingOutcome,
  stubAmendOutcome,
  stubDeleteReport,
  stubCreatePunishments,
  stubAmendPunishments,
  stubGetSuspendedPunishments,
  stubCreatePunishmentComment,
  stubEditPunishmentComment,
  stubDeletePunishmentComment,
  stubAloAmendOffenceDetails,
  stubGetDataInsightsChart,
  stubGetAgencyReportCounts,
  stubGetConsecutivePunishments,
}
