import type { Router } from 'express'

import config from '../config'
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
import continueReportSelectRoutes from './continueReport'

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
import hearingDetailsRoutes from './adjudicationForReport/hearingDetails'
import hearingTabRoutes from './adjudicationForReport/hearingTab'

import adjudicationReportRoutes from './adjudicationForReport/prisonerReport'
import scheduleHearingRoutes from './adjudicationForReport/scheduleHearing'
import viewScheduledHearingsRoutes from './viewAllHearingsAndReports/allHearings'
import acceptedReportConfirmationRoutes from './acceptedReportConfirmation'
import selectGenderRoutes from './selectGender'
import confirmDISFormsIssuedRoutes from './confirmDISFormsIssued'
import addDateAndTimeOfIssueRoutes from './addDateAndTimeOfIssue'

import { Services } from '../services'
import adjudicationPdfRoutes from './dis12Pdf'
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
import policeReasonForReferralRoutes from './hearingOutcome/referCase/policeReferral'
import damagesOwedRoutes from './hearingOutcome/damagesOwed'
import reasonForFindingRoutes from './hearingOutcome/reasonForFinding'
import cautionRoutes from './hearingOutcome/caution'
import reportAQuashedGuiltyFindingRoutes from './hearingOutcome/quashedGuiltyFinding'
import hearingCheckYourAnswersRoutes from './hearingOutcome/checkYourAnswers'
import PunishmentsAndDamagesRoutes from './adjudicationForReport/punishmentsTab'

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
  router.use(adjudicationUrls.continueReport.root, continueReportSelectRoutes({ placeOnReportService }))
  router.use(adjudicationUrls.printReport.root, printReportRoutes({ reportedAdjudicationsService }))
  router.use(
    adjudicationUrls.printPdf.root,
    adjudicationPdfRoutes({ reportedAdjudicationsService, decisionTreeService })
  )
  router.use(
    adjudicationUrls.prisonerReport.root,
    adjudicationReportRoutes({
      reportedAdjudicationsService,
      locationService,
      userService,
      decisionTreeService,
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
  router.use('/', homepageRoutes({ userService }))
  router.use(adjudicationUrls.ageOfPrisoner.root, ageOfPrisonerRoutes({ placeOnReportService }))

  router.use(
    adjudicationUrls.incidentAssociate.root,
    associatedPrisonerRoutes({ placeOnReportService, prisonerSearchService })
  )

  if (config.outcomeFeatureFlag === 'true') {
    router.use(
      adjudicationUrls.hearingDetails.root,
      hearingTabRoutes({ reportedAdjudicationsService, userService, outcomesService })
    )
  } else {
    router.use(
      adjudicationUrls.hearingDetails.root,
      hearingDetailsRoutes({ reportedAdjudicationsService, userService })
    )
  }

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

  router.use(adjudicationUrls.hearingReferralConfirmation.root, hearingReferralConfirmationRoutes({ userService }))

  router.use(
    adjudicationUrls.hearingAdjourned.root,
    hearingAdjournedRoutes({ hearingsService, userService, reportedAdjudicationsService })
  )
  router.use(adjudicationUrls.hearingPleaAndFinding.root, hearingPleaAndFindingRoutes({ userService, hearingsService }))

  router.use(adjudicationUrls.nextStepsPolice.root, nextStepPoliceRoutes({ userService, outcomesService }))
  router.use(
    adjudicationUrls.reasonForNotProceeding.root,
    notProceedRoutes({ userService, outcomesService, hearingsService, reportedAdjudicationsService })
  )
  router.use(adjudicationUrls.nextStepsInad.root, nextStepInadRoutes({ userService }))
  router.use(
    adjudicationUrls.moneyRecoveredForDamages.root,
    damagesOwedRoutes({ reportedAdjudicationsService, userService })
  )
  router.use(
    adjudicationUrls.hearingReasonForFinding.root,
    reasonForFindingRoutes({ reportedAdjudicationsService, hearingsService, userService })
  )
  router.use(
    adjudicationUrls.isThisACaution.root,
    cautionRoutes({ reportedAdjudicationsService, hearingsService, userService })
  )
  router.use(
    adjudicationUrls.reportAQuashedGuiltyFinding.root,
    reportAQuashedGuiltyFindingRoutes({ outcomesService, userService, reportedAdjudicationsService })
  )
  router.use(
    adjudicationUrls.hearingsCheckAnswers.root,
    hearingCheckYourAnswersRoutes({ hearingsService, userService })
  )
  router.use(
    adjudicationUrls.punishmentsAndDamages.root,
    PunishmentsAndDamagesRoutes({ reportedAdjudicationsService, userService, outcomesService })
  )

  return router
}
