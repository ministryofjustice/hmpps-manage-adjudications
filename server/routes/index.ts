import type { Router } from 'express'

import incidentStatementRoutes from './incidentStatement'
import incidentDetailsRoutes from './incidentDetails'
import incidentRoleRoutes from './incidentRole'
import detailsOfOffenceRoutes from './detailsOfOffence'
import checkYourAnswersRoutes from './checkYourAnswers'
import confirmedOnReportRoutes from './confirmedOnReport'
import taskListRoutes from './taskList'
import prisonerRoutes from './prisonerRoutes'
import prisonerSearchRoutes from './prisonerSearch'
import prisonerSelectRoutes from './prisonerSelect'
import yourCompletedReportsRoutes from './yourCompletedReports'
import allCompletedReportsRoutes from './viewAllHearingsAndReports/allReports'
import allTransferredReportsRoutes from './viewAllHearingsAndReports/allTransferReports'
import continueReportSelectRoutes from './continueReport'
import deleteReportRoutes from './deleteReport'

import homepageRoutes from './homepage'
import printReportRoutes from './printReport'
import selectAssociatedPrisonerRoutes from './selectAssociatedPrisoner'
import selectAssociatedStaffRoutes from './selectAssociatedStaff'
import offenceCodeDecisionsRoutes from './offenceCodeDecisions'
import deletePersonRoutes from './deletePerson'
import ageOfPrisonerRoutes from './ageOfPrisoner'
import detailsOfDamagesRoutes from './damages'
import detailsOfEvidenceRoutes from './evidence'
import detailsOfWitnessesRoutes from './witnesses'
import associatedPrisonerRoutes from './associatedPrisoner'

import totalsAdjudicationsAndLocationsRoutes from './dataInsights/totalsAdjudicationsAndLocationsTab'
import protectedAndResponsivityCharacteristicsRoutes from './dataInsights/protectedAndResponsivityCharacteristicsTab'
import offenceTypeRoutes from './dataInsights/offenceTypeTab'
import punishmentsRoutes from './dataInsights/punishmentsTab'
import pleasAndFindingsRoutes from './dataInsights/pleasAndFindingsTab'

import hearingTabRoutes from './adjudicationForReport/hearingTab'
import formsTabRoutes from './adjudicationForReport/formsTab'
import adjudicationReportRoutes from './adjudicationForReport/prisonerReport'
import scheduleHearingRoutes from './adjudicationForReport/scheduleHearing'
import viewScheduledHearingsRoutes from './viewAllHearingsAndReports/allHearings'
import acceptedReportConfirmationRoutes from './acceptedReportConfirmation'
import selectGenderRoutes from './selectGender'
import confirmDISFormsIssuedRoutes from './confirmDISFormsIssued'
import addDateAndTimeOfIssueRoutes from './addDateAndTimeOfIssue'

import { Services } from '../services'
import disPdfRoutes from './disPdf'
import adjudicationUrls from '../utils/urlGenerator'
import printCompletedDISFormsRoutes from './printCompletedDIS12Forms'
import enterHearingOutcomeRoutes from './hearingOutcome/enterHearingOutcome'
import hearingReasonForReferralRoutes from './hearingOutcome/referCase'
import hearingReferralConfirmationRoutes from './hearingOutcome/referralConfirmation'
import hearingAdjournedRoutes from './hearingOutcome/adjourn'
import hearingPleaAndFindingRoutes from './hearingOutcome/pleaAndFinding'
import nextStepPoliceRoutes from './nextSteps/police'
import notProceedRoutes from './notProceed'
import nextStepInadRoutes from './nextSteps/inad'
import nextStepGovRoutes from './nextSteps/gov'
import policeReasonForReferralRoutes from './hearingOutcome/referCase/policeReferral'
import govReasonForReferralRoutes from './hearingOutcome/referCase/govReferral'
import reasonForFindingRoutes from './hearingOutcome/reasonForFinding'
import reportAQuashedGuiltyFindingRoutes from './hearingOutcome/quashedGuiltyFinding'
import hearingCheckYourAnswersRoutes from './hearingOutcome/checkYourAnswers'
import punishmentsAndDamagesRoutes from './adjudicationForReport/punishmentsTab'
import PunishmentCommentRoutes from './punishmentsForReport/punishmentComment'
import PunishmentRoutes from './punishmentsForReport/punishment'
import awardPunishmentsRoutes from './punishmentsForReport/punishments/awardPunishments'
import numberOfAdditionalDaysRoutes from './punishmentsForReport/additionalDays/numberOfAdditionalDays'
import willPunishmentBeSuspendedRoutes from './punishmentsForReport/additionalDays/willPunishmentBeSuspended'
import punishmentSuspendedUntilAdditionalDays from './punishmentsForReport/additionalDays/suspendedUntilDate'
import checkPunishmentRoutes from './punishmentsForReport/punishments/checkPunishments'
import activateSuspendedPunishmentsRoutes from './punishmentsForReport/punishments/activateSuspendedPunishments'
import reviewerEditOffenceWarningRoute from './reviewerEditOffenceWarning'
import isPrisonerStillInEstablishmentRoutes from './isPrisonerStillInEstablishment'
import willPunishmentBeConsecutiveRoutes from './punishmentsForReport/additionalDays/willPunishmentBeConsecutive'
import whichPunishmentConsecutiveToRoutes from './punishmentsForReport/additionalDays/whichPunishmentConsecutiveTo'
import damagesAmountRoutes from './punishmentsForReport/punishments/damagesAmount'
import reasonForChangeRoutes from './punishmentsForReport/punishments/reasonForChange'
import punishmentNumberOfDaysRoutes from './punishmentsForReport/punishmentDates/numberOfDays'
import punishmentSuspendedRoutes from './punishmentsForReport/punishmentDates/isPunishmentSuspended'
import punishmentSuspendedUntilDateRoutes from './punishmentsForReport/punishmentDates/suspendedUntilDate'
import punishmentStartDateChoiceRoutes from './punishmentsForReport/punishmentDates/startDateChoice'
import enterStartDateRoutes from './punishmentsForReport/punishmentDates/enterStartDate'
import autoPunishmentScheduleRoutes from './punishmentsForReport/punishmentDates/autoPunishmentSchedule'
import createOnBehalfOfRoutes from './createOnBehalfOf'
import awardedPunishmentsAndDamagesRoutes from './punishmentsForReport/punishments/awardedPunishmentsAndDamages'
import suspendedPunishmentStartDateChoiceRoutes from './punishmentsForReport/punishmentSuspendedDates/startDateChoice'
import suspendedPunishmentNumberOfDaysRoutes from './punishmentsForReport/punishmentSuspendedDates/numberOfDays'
import suspendedPunishmentEnterStartDateRoutes from './punishmentsForReport/punishmentSuspendedDates/enterStartDate'
import autoPunishmentSuspendedScheduleRoutes from './punishmentsForReport/punishmentSuspendedDates/autoPunishmentSchedule'

import adjudicationHistoryRoutes from './adjudicationHistory'
import activePunishmentsRoutes from './activePunishments'
import adjudicationConsolidatedViewRoutes from './adjudicationConsolidatedView'

export default function routes(
  router: Router,
  {
    placeOnReportService,
    locationService,
    prisonerSearchService,
    reportedAdjudicationsService,
    userService,
    decisionTreeService,
    damagesSessionService,
    evidenceSessionService,
    witnessesSessionService,
    hearingsService,
    outcomesService,
    punishmentsService,
    chartApiService,
    createOnBehalfOfSessionService,
  }: Services
): Router {
  router.use(
    adjudicationUrls.offenceCodeSelection.root,
    offenceCodeDecisionsRoutes({
      placeOnReportService,
      userService,
      decisionTreeService,
      prisonerSearchService,
    })
  )
  router.use(adjudicationUrls.incidentDetails.root, incidentDetailsRoutes({ placeOnReportService, locationService }))
  router.use(adjudicationUrls.incidentRole.root, incidentRoleRoutes({ placeOnReportService }))
  router.use(
    adjudicationUrls.detailsOfOffence.root,
    detailsOfOffenceRoutes({ placeOnReportService, decisionTreeService })
  )
  router.use(adjudicationUrls.incidentStatement.root, incidentStatementRoutes({ placeOnReportService }))
  router.use(
    adjudicationUrls.checkYourAnswers.root,
    checkYourAnswersRoutes({
      placeOnReportService,
      locationService,
      decisionTreeService,
      reportedAdjudicationsService,
    })
  )
  router.use(adjudicationUrls.confirmedOnReport.root, confirmedOnReportRoutes({ reportedAdjudicationsService }))
  router.use(adjudicationUrls.taskList.root, taskListRoutes({ placeOnReportService }))
  router.use('/prisoner', prisonerRoutes({ placeOnReportService }))
  router.use(adjudicationUrls.searchForPrisoner.root, prisonerSearchRoutes())
  router.use(adjudicationUrls.selectPrisoner.root, prisonerSelectRoutes({ prisonerSearchService }))
  router.use(adjudicationUrls.selectAssociatedPrisoner.root, selectAssociatedPrisonerRoutes({ prisonerSearchService }))
  router.use(
    adjudicationUrls.selectAssociatedStaff.root,
    selectAssociatedStaffRoutes({ userService, placeOnReportService })
  )
  router.use(adjudicationUrls.yourCompletedReports.root, yourCompletedReportsRoutes({ reportedAdjudicationsService }))
  router.use(
    adjudicationUrls.allCompletedReports.root,
    allCompletedReportsRoutes({ reportedAdjudicationsService, userService })
  )
  router.use(
    adjudicationUrls.allTransferredReports.root,
    allTransferredReportsRoutes({ reportedAdjudicationsService, userService })
  )
  router.use(adjudicationUrls.continueReport.root, continueReportSelectRoutes({ placeOnReportService }))
  router.use(adjudicationUrls.deleteReport.root, deleteReportRoutes({ placeOnReportService }))
  router.use(adjudicationUrls.printReport.root, printReportRoutes({ reportedAdjudicationsService }))
  router.use(
    adjudicationUrls.printPdf.root,
    disPdfRoutes({ reportedAdjudicationsService, decisionTreeService, prisonerSearchService })
  )
  router.use(
    adjudicationUrls.prisonerReport.root,
    adjudicationReportRoutes({
      reportedAdjudicationsService,
      userService,
      decisionTreeService,
      locationService,
    })
  )
  router.use(adjudicationUrls.deletePerson.root, deletePersonRoutes({ placeOnReportService, userService }))
  router.use(
    adjudicationUrls.detailsOfDamages.root,
    detailsOfDamagesRoutes({
      placeOnReportService,
      damagesSessionService,
      reportedAdjudicationsService,
    })
  )
  router.use(
    adjudicationUrls.detailsOfEvidence.root,
    detailsOfEvidenceRoutes({
      placeOnReportService,
      evidenceSessionService,
      reportedAdjudicationsService,
    })
  )
  router.use(
    adjudicationUrls.detailsOfWitnesses.root,
    detailsOfWitnessesRoutes({
      placeOnReportService,
      witnessesSessionService,
      userService,
      decisionTreeService,
      reportedAdjudicationsService,
    })
  )
  router.use('/', homepageRoutes({ userService, reportedAdjudicationsService }))
  router.use(adjudicationUrls.ageOfPrisoner.root, ageOfPrisonerRoutes({ placeOnReportService }))

  router.use(
    adjudicationUrls.incidentAssociate.root,
    associatedPrisonerRoutes({ placeOnReportService, prisonerSearchService })
  )

  router.use(
    adjudicationUrls.hearingDetails.root,
    hearingTabRoutes({ reportedAdjudicationsService, userService, outcomesService })
  )

  router.use(adjudicationUrls.forms.root, formsTabRoutes({ reportedAdjudicationsService, userService }))

  router.use(adjudicationUrls.dataInsights.root, totalsAdjudicationsAndLocationsRoutes({ chartApiService }))
  router.use(
    adjudicationUrls.dataInsights.urls.totalsAdjudicationsAndLocations(),
    totalsAdjudicationsAndLocationsRoutes({ chartApiService })
  )
  router.use(
    adjudicationUrls.dataInsights.urls.protectedAndResponsivityCharacteristics(),
    protectedAndResponsivityCharacteristicsRoutes({ chartApiService })
  )
  router.use(adjudicationUrls.dataInsights.urls.offenceType(), offenceTypeRoutes({ chartApiService }))
  router.use(adjudicationUrls.dataInsights.urls.punishments(), punishmentsRoutes({ chartApiService }))
  router.use(adjudicationUrls.dataInsights.urls.pleasAndFindings(), pleasAndFindingsRoutes({ chartApiService }))

  router.use(
    adjudicationUrls.scheduleHearing.root,
    scheduleHearingRoutes({ reportedAdjudicationsService, locationService, userService })
  )

  router.use(
    adjudicationUrls.viewScheduledHearings.root,
    viewScheduledHearingsRoutes({ reportedAdjudicationsService, userService })
  )

  router.use(
    adjudicationUrls.acceptedReportConfirmation.root,
    acceptedReportConfirmationRoutes({ reportedAdjudicationsService })
  )

  router.use(adjudicationUrls.selectGender.root, selectGenderRoutes({ placeOnReportService }))

  router.use(
    adjudicationUrls.createOnBehalfOf.root,
    createOnBehalfOfRoutes({ placeOnReportService, createOnBehalfOfSessionService })
  )

  router.use(
    adjudicationUrls.confirmDISFormsIssued.root,
    confirmDISFormsIssuedRoutes({ reportedAdjudicationsService, locationService })
  )

  router.use(adjudicationUrls.addIssueDateTime.root, addDateAndTimeOfIssueRoutes({ reportedAdjudicationsService }))

  router.use(
    adjudicationUrls.printCompletedDisForms.root,
    printCompletedDISFormsRoutes({ reportedAdjudicationsService, locationService })
  )

  router.use(adjudicationUrls.enterHearingOutcome.root, enterHearingOutcomeRoutes({ userService, hearingsService }))

  router.use(
    adjudicationUrls.hearingReasonForReferral.root,
    hearingReasonForReferralRoutes({ hearingsService, userService, reportedAdjudicationsService })
  )

  router.use(
    adjudicationUrls.reasonForReferral.root,
    policeReasonForReferralRoutes({ outcomesService, userService, reportedAdjudicationsService })
  )

  router.use(
    adjudicationUrls.govReasonForReferral.root,
    govReasonForReferralRoutes({ userService, reportedAdjudicationsService, outcomesService })
  )

  router.use(adjudicationUrls.hearingReferralConfirmation.root, hearingReferralConfirmationRoutes({ userService }))

  router.use(
    adjudicationUrls.hearingAdjourned.root,
    hearingAdjournedRoutes({ hearingsService, userService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.hearingPleaAndFinding.root,
    hearingPleaAndFindingRoutes({ userService, hearingsService, reportedAdjudicationsService })
  )

  router.use(adjudicationUrls.nextStepsPolice.root, nextStepPoliceRoutes({ userService, outcomesService }))
  router.use(
    adjudicationUrls.reasonForNotProceeding.root,
    notProceedRoutes({ userService, outcomesService, hearingsService, reportedAdjudicationsService })
  )
  router.use(adjudicationUrls.nextStepsInad.root, nextStepInadRoutes({ userService }))
  router.use(adjudicationUrls.nextStepsGov.root, nextStepGovRoutes({ userService }))
  router.use(
    adjudicationUrls.hearingReasonForFinding.root,
    reasonForFindingRoutes({ reportedAdjudicationsService, hearingsService, userService })
  )
  router.use(
    adjudicationUrls.reportAQuashedGuiltyFinding.root,
    reportAQuashedGuiltyFindingRoutes({ outcomesService, userService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.hearingsCheckAnswers.root,
    hearingCheckYourAnswersRoutes({ hearingsService, userService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.punishmentsAndDamages.root,
    punishmentsAndDamagesRoutes({ reportedAdjudicationsService, userService, punishmentsService })
  )
  router.use(adjudicationUrls.punishmentComment.root, PunishmentCommentRoutes({ userService, punishmentsService }))
  router.use(adjudicationUrls.punishment.root, PunishmentRoutes({ userService, punishmentsService }))

  router.use(
    adjudicationUrls.numberOfAdditionalDays.root,
    numberOfAdditionalDaysRoutes({ userService, punishmentsService, reportedAdjudicationsService })
  )

  router.use(
    adjudicationUrls.isPunishmentSuspendedAdditionalDays.root,
    willPunishmentBeSuspendedRoutes({ userService, punishmentsService })
  )

  router.use(
    adjudicationUrls.isPunishmentConsecutive.root,
    willPunishmentBeConsecutiveRoutes({ userService, punishmentsService })
  )
  router.use(
    adjudicationUrls.whichPunishmentIsItConsecutiveTo.root,
    whichPunishmentConsecutiveToRoutes({ userService, punishmentsService })
  )
  router.use(adjudicationUrls.awardPunishments.root, awardPunishmentsRoutes({ punishmentsService, userService }))
  router.use(adjudicationUrls.checkPunishments.root, checkPunishmentRoutes({ punishmentsService, userService }))
  router.use(
    adjudicationUrls.activateSuspendedPunishments.root,
    activateSuspendedPunishmentsRoutes({ punishmentsService, userService })
  )
  router.use(
    adjudicationUrls.reasonForChangePunishment.root,
    reasonForChangeRoutes({ punishmentsService, userService })
  )

  router.use(
    adjudicationUrls.awardedPunishmentsAndDamages.root,
    awardedPunishmentsAndDamagesRoutes({ reportedAdjudicationsService, locationService })
  )

  router.use(
    adjudicationUrls.reviewerEditOffenceWarning.root,
    reviewerEditOffenceWarningRoute({ decisionTreeService, reportedAdjudicationsService, userService })
  )
  router.use(adjudicationUrls.damagesAmount.root, damagesAmountRoutes({ punishmentsService, userService }))

  router.use(adjudicationUrls.isPrisonerStillInEstablishment.root, isPrisonerStillInEstablishmentRoutes())

  router.use(
    adjudicationUrls.punishmentNumberOfDays.root,
    punishmentNumberOfDaysRoutes({ userService, punishmentsService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.punishmentIsSuspended.root,
    punishmentSuspendedRoutes({ userService, punishmentsService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.punishmentSuspendedUntil.root,
    punishmentSuspendedUntilDateRoutes({ userService, punishmentsService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.punishmentStartDate.root,
    enterStartDateRoutes({ userService, punishmentsService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.punishmentAutomaticDateSchedule.root,
    autoPunishmentScheduleRoutes({ userService, punishmentsService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.whenWillPunishmentStart.root,
    punishmentStartDateChoiceRoutes({ userService, punishmentsService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.suspendedPunishmentNumberOfDays.root,
    suspendedPunishmentNumberOfDaysRoutes({
      userService,
      punishmentsService,
      reportedAdjudicationsService,
    })
  )
  router.use(
    adjudicationUrls.suspendedPunishmentStartDateChoice.root,
    suspendedPunishmentStartDateChoiceRoutes({
      userService,
      punishmentsService,
      reportedAdjudicationsService,
    })
  )
  router.use(
    adjudicationUrls.suspendedPunishmentStartDate.root,
    suspendedPunishmentEnterStartDateRoutes({
      userService,
      punishmentsService,
      reportedAdjudicationsService,
    })
  )
  router.use(
    adjudicationUrls.suspendedPunishmentAutoDates.root,
    autoPunishmentSuspendedScheduleRoutes({
      userService,
      punishmentsService,
    })
  )
  router.use(
    adjudicationUrls.punishmentSuspendedUntilAdditionalDays.root,
    punishmentSuspendedUntilAdditionalDays({
      userService,
      punishmentsService,
      reportedAdjudicationsService,
    })
  )
  router.use(adjudicationUrls.adjudicationHistory.root, adjudicationHistoryRoutes({ reportedAdjudicationsService }))
  router.use(
    adjudicationUrls.activePunishments.root,
    activePunishmentsRoutes({ reportedAdjudicationsService, punishmentsService })
  )
  router.use(
    adjudicationUrls.prisonerReportConsolidated.root,
    adjudicationConsolidatedViewRoutes({
      reportedAdjudicationsService,
      userService,
      decisionTreeService,
      punishmentsService,
    })
  )

  return router
}
