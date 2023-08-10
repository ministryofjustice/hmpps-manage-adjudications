/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'cypress'

import { resetStubs } from './integration_tests/mockApis/wiremock'
import prisonApi from './integration_tests/mockApis/prisonApi'
import curiousApi from './integration_tests/mockApis/curiousApi'
import { CaseLoad } from './server/data/prisonApiClient'
import auth from './integration_tests/mockApis/auth'
import prisonerSearch from './integration_tests/mockApis/prisonerSearch'
import adjudications from './integration_tests/mockApis/adjudications'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import users from './integration_tests/mockApis/users'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  videoUploadOnPasses: false,
  taskTimeout: 60000,
  viewportWidth: 1024,
  viewportHeight: 768,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        getSignInUrl: auth.getSignInUrl,
        stubSignIn: (caseLoads: CaseLoad[]) => {
          const userCaseLoads: CaseLoad[] = caseLoads || [
            {
              caseLoadId: 'MDI',
              description: 'Moorland (HMP & YOI)',
              type: 'INST',
              caseloadFunction: 'TEST',
              currentlyActive: true,
            },
          ]
          const agencyIdResponse =
            userCaseLoads.length > 0
              ? {
                  agencyId: userCaseLoads[0].caseLoadId,
                  response: {
                    agencyId: userCaseLoads[0].caseLoadId,
                    description: userCaseLoads[0].description,
                  },
                }
              : {
                  agencyId: 'MDI',
                  response: { agencyId: 'MDI', description: 'Moorland (HMP & YOI)' },
                }

          return Promise.all([
            auth.stubSignIn(),
            adjudications.stubGetAgencyReportCounts({
              response: {
                reviewTotal: 2,
                transferReviewTotal: 1,
              },
            }),
            prisonApi.stubUserCaseloads(userCaseLoads),
            prisonApi.stubGetAgency(agencyIdResponse),
          ])
        },
        stubGetUserFromUsername: users.stubGetUserFromUsername,

        stubSearch: prisonerSearch.stubSearch,
        stubSearchPrisonerDetails: prisonerSearch.stubSearchPrisonerDetails,
        stubAuthUser: users.stubAuthUser,
        stubUserOriginatingAgency: users.stubUserOriginatingAgency,
        stubUserRoles: users.stubUserRoles,
        stubGetUser: users.stubGetUser,
        stubGetUserFromNames: users.stubGetUserFromNames,
        stubGetEmail: users.stubGetEmail,

        stubTokenPing: status => tokenVerification.stubPing(status),
        stubAuthPing: status => auth.stubPing(status),
        stubManageUsersApiPing: status => users.stubPing(status),
        stubPrisonerSearchPing: status => prisonerSearch.stubPing(status),
        stubPrisonApiPing: status => prisonApi.stubPing(status),
        stubAdjudicationsPing: status => adjudications.stubPing(status),
        stubGetPrisonerDetails: prisonApi.stubGetPrisonerDetails,
        stubGetLocations: prisonApi.stubGetLocations,
        stubGetLocationsByType: prisonApi.stubGetLocationsByType,
        stubGetLocation: prisonApi.stubGetLocation,
        stubGetAgency: prisonApi.stubGetAgency,
        stubGetSecondaryLanguages: prisonApi.stubGetSecondaryLanguages,
        stubGetBatchPrisonerDetails: prisonApi.stubGetBatchPrisonerDetails,
        stubGetUsersLocations: prisonApi.stubGetUsersLocations,
        stubGetPrisonersAlerts: prisonApi.stubGetPrisonersAlerts,
        stubGetMovementByOffender: prisonApi.stubGetMovementByOffender,
        stubValidateChargeNumber: prisonApi.stubValidateChargeNumber,

        stubStartNewDraftAdjudication: adjudications.stubStartNewDraftAdjudication,
        stubPostDraftIncidentStatement: adjudications.stubPostDraftIncidentStatement,
        stubPutDraftIncidentStatement: adjudications.stubPutDraftIncidentStatement,
        stubGetDraftAdjudication: adjudications.stubGetDraftAdjudication,
        stubSubmitCompleteDraftAdjudication: adjudications.stubSubmitCompleteDraftAdjudication,
        stubEditDraftIncidentDetails: adjudications.stubEditDraftIncidentDetails,
        stubUpdateDraftIncidentRole: adjudications.stubUpdateDraftIncidentRole,
        stubGetReportedAdjudication: adjudications.stubGetReportedAdjudication,

        stubGetLearnerProfile: curiousApi.stubGetLearnerProfile,
        stubGetAllDraftAdjudicationsForUser: adjudications.stubGetAllDraftAdjudicationsForUser,
        stubGetYourReportedAdjudications: adjudications.stubGetYourReportedAdjudications,
        stubGetAllReportedAdjudications: adjudications.stubGetAllReportedAdjudications,
        stubCreateDraftFromCompleteAdjudication: adjudications.stubCreateDraftFromCompleteAdjudication,
        stubGetOffenceRule: adjudications.stubGetOffenceRule,
        stubSaveOffenceDetails: adjudications.stubSaveOffenceDetails,
        stubSaveEvidenceDetails: adjudications.stubSaveEvidenceDetails,
        stubSaveWitnessDetails: adjudications.stubSaveWitnessDetails,
        verifySaveOffenceDetails: adjudications.verifySaveOffenceDetails,
        stubUpdateAdjudicationStatus: adjudications.stubUpdateAdjudicationStatus,
        stubSaveYouthOffenderStatus: adjudications.stubSaveYouthOffenderStatus,
        stubSaveAssociatedPrisoner: adjudications.stubSaveAssociatedPrisoner,
        stubCancelHearing: adjudications.stubCancelHearing,
        stubCancelHearingV1: adjudications.stubCancelHearingV1,
        stubScheduleHearing: adjudications.stubScheduleHearing,
        stubScheduleHearingV1: adjudications.stubScheduleHearingV1,
        stubAmendHearing: adjudications.stubAmendHearing,
        stubAmendHearingV1: adjudications.stubAmendHearingV1,
        stubGetHearingsGivenAgencyAndDate: adjudications.stubGetHearingsGivenAgencyAndDate,
        stubAmendPrisonerGender: adjudications.stubAmendPrisonerGender,
        stubGetIssueDataDiscDate: adjudications.stubGetIssueDataFilteredOnDiscDate,
        stubGetIssueDataHearingDate: adjudications.stubGetIssueDataFilteredOnHearingDate,
        stubPutDateTimeOfIssue: adjudications.stubPutDateTimeOfIssue,
        stubCreateReferral: adjudications.stubCreateReferral,
        stubCreateAdjourn: adjudications.stubCreateAdjourn,
        stubCreatePoliceReferral: adjudications.stubCreatePoliceReferral,
        stubCreateProsecution: adjudications.stubCreateProsecution,
        stubCreateNotProceed: adjudications.stubCreateNotProceed,
        stubRemoveReferral: adjudications.stubRemoveReferral,
        stubRemoveNotProceedOrQuashed: adjudications.stubRemoveNotProceedOrQuashed,
        stubCancelCompleteHearingOutcome: adjudications.stubCancelCompleteHearingOutcome,
        stubPostCompleteDismissedHearing: adjudications.stubPostCompleteDismissedHearing,
        stubPostCompleteHearingChargeProved: adjudications.stubPostCompleteHearingChargeProved,
        stubPostCompleteHearingNotProceed: adjudications.stubPostCompleteHearingNotProceed,
        stubRemoveAdjourn: adjudications.stubRemoveAdjourn,
        stubPostQuashOutcome: adjudications.stubPostQuashOutcome,
        stubAmendHearingOutcome: adjudications.stubAmendHearingOutcome,
        stubAmendOutcome: adjudications.stubAmendOutcome,
        stubDeleteReport: adjudications.stubDeleteReport,
        stubCreatePunishments: adjudications.stubCreatePunishments,
        stubAmendPunishments: adjudications.stubAmendPunishments,
        stubGetSuspendedPunishments: adjudications.stubGetSuspendedPunishments,
        stubCreatePunishmentComment: adjudications.stubCreatePunishmentComment,
        stubEditPunishmentComment: adjudications.stubEditPunishmentComment,
        stubDeletePunishmentComment: adjudications.stubDeletePunishmentComment,
        stubAloAmendOffenceDetails: adjudications.stubAloAmendOffenceDetails,
        stubGetDataInsightsChart: adjudications.stubGetDataInsightsChart,
        stubGetAgencyReportCounts: adjudications.stubGetAgencyReportCounts,
        stubGetConsecutivePunishments: adjudications.stubGetConsecutivePunishments,
      })
    },

    baseUrl: 'http://localhost:3007',
    specPattern: 'integration_tests/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
