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
import allCompletedReportsRoutes from './allCompletedReports'
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
import hearingDetailsRoutes from './adjudicationTabbedParent/hearingDetails'
import adjudicationReportRoutes from './adjudicationTabbedParent/prisonerReport'
import scheduleHearingRoutes from './adjudicationTabbedParent/scheduleHearing'
import viewScheduledHearingsRoutes from './viewScheduledHearings'
import acceptedReportConfirmationRoutes from './acceptedReportConfirmation'
import selectGenderRoutes from './selectGender'
import confirmDISFormsIssuedRoutes from './confirmDISFormsIssued'
import addDateAndTimeOfIssueRoutes from './addDateAndTimeOfIssue'

import { Services } from '../services'
import adjudicationPdfRoutes from './adjudicationPdf'
import adjudicationUrls from '../utils/urlGenerator'

export default function routes(
  router: Router,
  {
    placeOnReportService,
    locationService,
    prisonerSearchService,
    reportedAdjudicationsService,
    userService,
    offenceSessionService,
    allOffencesSessionService,
    decisionTreeService,
    damagesSessionService,
    evidenceSessionService,
    witnessesSessionService,
  }: Services
): Router {
  router.use(
    adjudicationUrls.offenceCodeSelection.root,
    offenceCodeDecisionsRoutes({
      placeOnReportService,
      userService,
      offenceSessionService,
      decisionTreeService,
      prisonerSearchService,
    })
  )
  router.use(adjudicationUrls.incidentDetails.root, incidentDetailsRoutes({ placeOnReportService, locationService }))
  router.use(adjudicationUrls.incidentRole.root, incidentRoleRoutes({ placeOnReportService }))
  router.use(
    adjudicationUrls.detailsOfOffence.root,
    detailsOfOffenceRoutes({ placeOnReportService, allOffencesSessionService, decisionTreeService })
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
  router.use(adjudicationUrls.selectReport.root, continueReportSelectRoutes({ placeOnReportService }))
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
  router.use(
    adjudicationUrls.ageOfPrisoner.root,
    ageOfPrisonerRoutes({ placeOnReportService, allOffencesSessionService })
  )

  router.use(
    adjudicationUrls.incidentAssociate.root,
    associatedPrisonerRoutes({ placeOnReportService, prisonerSearchService })
  )

  router.use(adjudicationUrls.hearingDetails.root, hearingDetailsRoutes({ reportedAdjudicationsService, userService }))
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

  return router
}
