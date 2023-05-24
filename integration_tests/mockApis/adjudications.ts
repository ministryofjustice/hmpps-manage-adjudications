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

const stubGetAllDraftAdjudicationsForUser = ({
  agencyId = 'MDI',
  number = 0,
  size = 20,
  allContent = [],
  filter = {
    toDate: moment().format('YYYY-MM-DD'),
    fromDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
  },
}: {
  agencyId: string
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
    `/adjudications/draft-adjudications/my/agency/${agencyId}?page=${number}&size=${size}` +
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
    agencyId = 'MDI',
    number = 0,
    size = 20,
    allContent = [],
    filter = {
      status: null,
      toDate: moment().format('YYYY-MM-DD'),
      fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
    },
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
      `${(filter.status && `&status=${filter.status}`) || `&status=${allStatuses}`}`
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
  adjudicationNumber,
  response = {},
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${adjudicationNumber}/offence-details`,
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
  adjudicationNumber,
  response = {},
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${adjudicationNumber}/evidence`,
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
  adjudicationNumber,
  response = {},
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${adjudicationNumber}/witnesses`,
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
  offenceDetails: OffenceDetails
}) =>
  verifyRequest({
    requestUrlPattern: `/adjudications/draft-adjudications/${adjudicationNumber}/offence-details`,
    method: 'PUT',
    body: {
      offenceDetails,
    },
  })

const stubUpdateAdjudicationStatus = ({
  adjudicationNumber,
  response,
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/status`,
    },
    response,
  })

const stubSaveYouthOffenderStatus = ({
  adjudicationNumber,
  response = {},
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${adjudicationNumber}/applicable-rules`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubSaveAssociatedPrisoner = ({ adjudicationNumber, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/draft-adjudications/${adjudicationNumber}/associated-prisoner`,
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
  adjudicationNumber,
  response = {},
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing`,
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
  adjudicationNumber,
  response = {},
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing/v2`,
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
  adjudicationNumber,
  response = {},
}: {
  adjudicationNumber: number
  response: Record<string, unknown>
}): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/remove-completed-hearing`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubScheduleHearing = ({ adjudicationNumber, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing/v2`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubScheduleHearingV1 = ({ adjudicationNumber, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendHearingV1 = ({ adjudicationNumber, hearingId, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing/${hearingId}`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendHearing = ({ adjudicationNumber, status = 200, response = {} }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing/v2`,
    },
    response: {
      status,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetHearingsGivenAgencyAndDate = ({
  agencyId = 'MDI',
  hearingDate,
  status = 200,
  response = {},
}): SuperAgentRequest => {
  const today = moment().format('YYYY-MM-DD')
  const url = `/adjudications/reported-adjudications/hearings/agency/${agencyId}`
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
  agencyId = 'MDI',
  filter = {
    fromDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD'),
  },
  response,
}: {
  agencyId: string
  filter: {
    fromDate: string
    toDate: string
  }
  response
}): SuperAgentRequest => {
  const path =
    `/adjudications/reported-adjudications/agency/${agencyId}/issue?` +
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
  agencyId = 'MDI',
  filter = {
    fromDate: moment().format('YYYY-MM-DD'),
    toDate: moment().add(2, 'days').format('YYYY-MM-DD'),
    issueStatus: allIssueStatuses,
  },
  response,
}: {
  agencyId: string
  filter: {
    fromDate: string
    toDate: string
    issueStatus: IssueStatus[]
  }
  response
}): SuperAgentRequest => {
  const path =
    `/adjudications/reported-adjudications/agency/${agencyId}/print?` +
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

const stubPutDateTimeOfIssue = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/issue`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreateAdjourn = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing/outcome/adjourn`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreateReferral = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing/outcome/referral`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreatePoliceReferral = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/outcome/refer-police`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreateProsecution = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/outcome/prosecution`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreateNotProceed = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/outcome/not-proceed`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubRemoveReferral = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/remove-referral`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubRemoveNotProceedOrQuashed = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/outcome`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubRemoveAdjourn = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'DELETE',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing/outcome/adjourn`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostCompleteDismissedHearing = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/complete-hearing/dismissed`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostCompleteHearingChargeProved = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/complete-hearing/charge-proved`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostCompleteHearingNotProceed = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/complete-hearing/not-proceed`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubPostQuashOutcome = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/outcome/quashed`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendHearingOutcome = ({ adjudicationNumber, status, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/hearing/outcome/${status}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendOutcome = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/outcome`,
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

const stubCreatePunishments = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/punishments`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubAmendPunishments = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'PUT',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/punishments`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubGetSuspendedPunishments = ({ prisonerNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      url: `/adjudications/reported-adjudications/punishments/${prisonerNumber}/suspended`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: response,
    },
  })

const stubCreatePunishmentComment = ({ adjudicationNumber, response }): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'POST',
      url: `/adjudications/reported-adjudications/${adjudicationNumber}/punishments/comment`,
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
}
