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
    '/check-your-answers',
    checkYourAnswersRoutes({
      placeOnReportService,
      locationService,
      decisionTreeService,
    })
  )
  router.use(confirmedOnReport.root, confirmedOnReportRoutes({ reportedAdjudicationsService }))
  router.use(taskList.root, taskListRoutes({ placeOnReportService }))
  router.use('/prisoner', prisonerRoutes({ placeOnReportService }))
  router.use('/search-for-prisoner', prisonerSearchRoutes())
  router.use('/select-prisoner', prisonerSelectRoutes({ prisonerSearchService }))
  router.use('/select-associated-prisoner', selectAssociatedPrisonerRoutes({ prisonerSearchService }))
  router.use('/select-associated-staff', selectAssociatedStaffRoutes({ userService, placeOnReportService }))
  router.use('/your-completed-reports', yourCompletedReportsRoutes({ reportedAdjudicationsService }))
  router.use('/all-completed-reports', allCompletedReportsRoutes({ reportedAdjudicationsService, userService }))
  router.use('/select-report', continueReportSelectRoutes({ placeOnReportService }))
  router.use('/print-report', printReportRoutes({ reportedAdjudicationsService }))
  router.use('/print', adjudicationPdfRoutes({ reportedAdjudicationsService, decisionTreeService }))
  router.use(
    '/prisoner-report',
    prisonerReportRoutes({
      reportedAdjudicationsService,
      locationService,
      userService,
      decisionTreeService,
    })
  )
  router.use('/delete-person', deletePersonRoutes({ placeOnReportService, userService }))
  router.use('/', homepageRoutes({ userService }))
  return router
}
