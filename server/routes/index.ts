import type { Router } from 'express'

import incidentStatementRoutes from './incidentStatement'
import incidentDetailsRoutes from './incidentDetails'
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
import prisonerReportRoutes from './prisonerReport'
import homepageRoutes from './homepage'
import printReportRoutes from './printReport'
import selectAssociatedPrisonerRoutes from './selectAssociatedPrisoner'
import selectAssociatedStaffRoutes from './selectAssociatedStaff'
import offenceCodeDecisionsRoutes from './offenceCodeDecisions'
import deletePersonRoutes from './deletePerson'

import { Services } from '../services'
import adjudicationPdfRoutes from './adjudicationPdf'
import {
  offenceCodeSelection,
  detailsOfOffence,
  taskList,
  confirmedOnReport,
  incidentDetails,
  incidentStatementUrls,
  searchForPrisoner,
  checkYourAnswers,
  selectPrisoner,
  selectAssociatedPrisoner,
  selectAssociatedStaff,
  yourCompletedReports,
  allCompletedReports,
  selectReport,
  printReport,
  printPdf,
  prisonerReport,
  deletePerson,
} from '../utils/urlGenerator'

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
  }: Services
): Router {
  router.use(
    offenceCodeSelection.root,
    offenceCodeDecisionsRoutes({ placeOnReportService, userService, offenceSessionService, decisionTreeService })
  )
  router.use(incidentDetails.root, incidentDetailsRoutes({ placeOnReportService, locationService }))
  router.use(
    detailsOfOffence.root,
    detailsOfOffenceRoutes({ placeOnReportService, allOffencesSessionService, decisionTreeService })
  )
  router.use(incidentStatementUrls.root, incidentStatementRoutes({ placeOnReportService }))
  router.use(
    checkYourAnswers.root,
    checkYourAnswersRoutes({
      placeOnReportService,
      locationService,
      decisionTreeService,
    })
  )
  router.use(confirmedOnReport.root, confirmedOnReportRoutes({ reportedAdjudicationsService }))
  router.use(taskList.root, taskListRoutes({ placeOnReportService }))
  router.use('/prisoner', prisonerRoutes({ placeOnReportService }))
  router.use(searchForPrisoner.root, prisonerSearchRoutes())
  router.use(selectPrisoner.root, prisonerSelectRoutes({ prisonerSearchService }))
  router.use(selectAssociatedPrisoner.root, selectAssociatedPrisonerRoutes({ prisonerSearchService }))
  router.use(selectAssociatedStaff.root, selectAssociatedStaffRoutes({ userService, placeOnReportService }))
  router.use(yourCompletedReports.root, yourCompletedReportsRoutes({ reportedAdjudicationsService }))
  router.use(allCompletedReports.root, allCompletedReportsRoutes({ reportedAdjudicationsService, userService }))
  router.use(selectReport.root, continueReportSelectRoutes({ placeOnReportService }))
  router.use(printReport.root, printReportRoutes({ reportedAdjudicationsService }))
  router.use(printPdf.root, adjudicationPdfRoutes({ reportedAdjudicationsService, decisionTreeService }))
  router.use(
    prisonerReport.root,
    prisonerReportRoutes({
      reportedAdjudicationsService,
      locationService,
      userService,
      decisionTreeService,
    })
  )
  router.use(deletePerson.root, deletePersonRoutes({ placeOnReportService, userService }))
  router.use('/', homepageRoutes({ userService }))
  return router
}
