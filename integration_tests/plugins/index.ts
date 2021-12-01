import { resetStubs } from '../mockApis/wiremock'
import prisonApi from '../mockApis/prisonApi'
import curiousApi from '../mockApis/curiousApi'
import { CaseLoad } from '../../server/data/prisonApiClient'
import auth from '../mockApis/auth'
import prisonerSearch from '../mockApis/prisonerSearch'
import adjudications from '../mockApis/adjudications'
import tokenVerification from '../mockApis/tokenVerification'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: resetStubs,

    getSignInUrl: auth.getSignInUrl,
    stubSignIn: (caseLoads: CaseLoad[]) => Promise.all([auth.stubSignIn(), prisonApi.stubUserCaseloads(caseLoads)]),
    stubGetUserFromUsername: auth.stubGetUserFromUsername,

    stubSearch: prisonerSearch.stubSearch,
    stubAuthUser: auth.stubUser,
    stubUserRoles: auth.stubUserRoles,

    stubTokenPing: status => tokenVerification.stubPing(status),
    stubAuthPing: status => auth.stubPing(status),
    stubPrisonerSearchPing: status => prisonerSearch.stubPing(status),
    stubPrisonApiPing: status => prisonApi.stubPing(status),
    stubAdjudicationsPing: status => adjudications.stubPing(status),
    stubGetPrisonerDetails: prisonApi.stubGetPrisonerDetails,
    stubGetLocations: prisonApi.stubGetLocations,
    stubGetSecondaryLanguages: prisonApi.stubGetSecondaryLanguages,
    stubGetBatchPrisonerDetails: prisonApi.stubGetBatchPrisonerDetails,

    stubStartNewDraftAdjudication: adjudications.stubStartNewDraftAdjudication,
    stubPostDraftIncidentStatement: adjudications.stubPostDraftIncidentStatement,
    stubGetDraftAdjudication: adjudications.stubGetDraftAdjudication,
    stubSubmitCompleteDraftAdjudication: adjudications.stubSubmitCompleteDraftAdjudication,
    stubEditDraftIncidentDetails: adjudications.stubEditDraftIncidentDetails,
    stubGetReportedAdjudication: adjudications.stubGetReportedAdjudication,

    stubGetNeurodiversities: curiousApi.stubGetNeurodiversities,
    stubGetAllDraftAdjudicationsForUser: adjudications.stubGetAllDraftAdjudicationsForUser,
    stubGetYourReportedAdjudications: adjudications.stubGetYourReportedAdjudications,
    stubGetAllReportedAdjudications: adjudications.stubGetAllReportedAdjudications,
  })
}
