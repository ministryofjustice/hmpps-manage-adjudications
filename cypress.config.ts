/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'cypress'

import { resetStubs } from './integration_tests/mockApis/wiremock'
import prisonApi from './integration_tests/mockApis/prisonApi'
import locationsInsidePrisonApi from './integration_tests/mockApis/locationsInsidePrisonApi'
import nomisSyncPrisonerMappingApi from './integration_tests/mockApis/nomisSyncPrisonerMappingApi'
import curiousApi from './integration_tests/mockApis/curiousApi'
import { CaseLoad } from './server/data/prisonApiClient'
import auth from './integration_tests/mockApis/auth'
import prisonerSearch from './integration_tests/mockApis/prisonerSearch'
import adjudications from './integration_tests/mockApis/adjudications'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import users from './integration_tests/mockApis/users'
import feComponent from './integration_tests/mockApis/feComponent'
import alertApi from './integration_tests/mockApis/alertApi'

export default defineConfig({
  projectId: 'gy9q8q',
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  viewportWidth: 1024,
  viewportHeight: 768,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        getSignInUrl: auth.getSignInUrl,
        stubSignIn: (roles: string[] = ['ROLE_ADJUDICATIONS_REVIEWER', 'ROLE_GLOBAL_SEARCH']) => {
          const userCaseLoads = [
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
            auth.stubSignIn(roles),
            adjudications.stubGetAgencyReportCounts({
              response: {
                reviewTotal: 2,
                transferReviewTotal: 1,
                transferOutTotal: 1,
                transferAllTotal: 1,
                hearingsToScheduleTotal: 1,
              },
            }),
            prisonApi.stubUserCaseloads(userCaseLoads),
            prisonApi.stubGetAgency(agencyIdResponse),
            feComponent.stubFeComponents({}),
            feComponent.stubFeComponentsJs(),
            feComponent.stubFeComponentsCss(),
          ])
        },

        stubGetUserFromUsername: users.stubGetUserFromUsername,
        stubSearch: prisonerSearch.stubSearch,
        stubSearchPrisonerDetails: prisonerSearch.stubSearchPrisonerDetails,
        stubAuthUser: users.stubAuthUser,
        stubUserOriginatingAgency: users.stubUserOriginatingAgency,
        stubGetUser: users.stubGetUser,
        stubGetUserFromNames: users.stubGetUserFromNames,
        stubGetEmail: users.stubGetEmail,

        stubTokenPing: status => tokenVerification.stubPing(status),
        stubAuthPing: status => auth.stubPing(status),
        stubManageUsersApiPing: status => users.stubPing(status),
        stubPrisonerSearchPing: status => prisonerSearch.stubPing(status),
        stubPrisonApiPing: status => prisonApi.stubPing(status),
        stubLocationsInsidePrisonApiPing: status => locationsInsidePrisonApi.stubPing(status),
        stubNomisSyncPrisonerMappingApiPing: status => nomisSyncPrisonerMappingApi.stubPing(status),
        stubAdjudicationsPing: status => adjudications.stubPing(status),
        stubGetPrisonerDetails: prisonApi.stubGetPrisonerDetails,
        stubGetLocations: locationsInsidePrisonApi.stubGetLocations,
        stubGetAdjudicationLocations: locationsInsidePrisonApi.stubGetAdjudicationLocations,
        stubGetLocation: locationsInsidePrisonApi.stubGetLocation,
        stubGetLocationWithUuid: locationsInsidePrisonApi.stubGetLocationWithUuid,
        stubGetDpsLocationId: nomisSyncPrisonerMappingApi.stubGetDpsLocationId,
        stubGetNomisLocationId: nomisSyncPrisonerMappingApi.stubGetNomisLocationId,
        stubGetAgency: prisonApi.stubGetAgency,
        stubGetSecondaryLanguages: prisonApi.stubGetSecondaryLanguages,
        stubGetBatchPrisonerDetails: prisonApi.stubGetBatchPrisonerDetails,
        stubGetUsersLocations: prisonApi.stubGetUsersLocations,
        stubGetPrisonersAlerts: alertApi.stubGetPrisonersAlerts,
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
        stubGetTransferredAdjudications: adjudications.stubGetTransferredAdjudications,
        stubCreateDraftFromCompleteAdjudication: adjudications.stubCreateDraftFromCompleteAdjudication,
        stubGetOffenceRule: adjudications.stubGetOffenceRule,
        stubGetAllOffenceRules: adjudications.stubGetAllOffenceRules,
        stubSaveOffenceDetails: adjudications.stubSaveOffenceDetails,
        stubSaveEvidenceDetails: adjudications.stubSaveEvidenceDetails,
        stubSaveWitnessDetails: adjudications.stubSaveWitnessDetails,
        verifySaveOffenceDetails: adjudications.verifySaveOffenceDetails,
        stubUpdateAdjudicationStatus: adjudications.stubUpdateAdjudicationStatus,
        stubSaveYouthOffenderStatus: adjudications.stubSaveYouthOffenderStatus,
        stubSaveAssociatedPrisoner: adjudications.stubSaveAssociatedPrisoner,
        stubCancelHearing: adjudications.stubCancelHearing,
        stubScheduleHearing: adjudications.stubScheduleHearing,
        stubAmendHearing: adjudications.stubAmendHearing,
        stubGetHearingsGivenAgencyAndDate: adjudications.stubGetHearingsGivenAgencyAndDate,
        stubAmendPrisonerGender: adjudications.stubAmendPrisonerGender,
        stubSetCreatedOnBehalfOf: adjudications.stubSetCreatedOnBehalfOf,
        stubSetDraftCreatedOnBehalfOf: adjudications.stubSetDraftCreatedOnBehalfOf,
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
        stubGetLastUpdatedDate: adjudications.stubGetLastUpdatedDate,
        stubGetAgencyReportCounts: adjudications.stubGetAgencyReportCounts,
        stubGetConsecutivePunishments: adjudications.stubGetConsecutivePunishments,
        stubCreateGovReferral: adjudications.stubCreateGovReferral,
        stubGetPrisonerAdjudicationHistory: adjudications.stubGetPrisonerAdjudicationHistory,
        stubPrisonerActivePunishments: adjudications.stubPrisonerActivePunishments,
        stubCompleteRehabActivity: adjudications.stubCompleteRehabActivity,
        stubFeComponents: feComponent.stubFeComponents,
      })
    },

    baseUrl: 'http://localhost:3007',
    specPattern: 'integration_tests/integration/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
