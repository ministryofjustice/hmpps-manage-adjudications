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
import prisonerReportRoutes from './prisonerReport'
import homepageRoutes from './homepage'
import printReportRoutes from './printReport'
import selectAssociatedPrisonerRoutes from './selectAssociatedPrisoner'
import selectAssociatedStaffRoutes from './selectAssociatedStaff'
import offenceCodeDecisionsRoutes from './offenceCodeDecisions'
import deletePersonRoutes from './deletePerson'
import ageOfPrisonerRoutes from './ageOfPrisoner'

import { Services } from '../services'
import adjudicationPdfRoutes from './adjudicationPdf'
import adjudicationUrls from '../utils/urlGenerator'
import config from '../config'

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
    adjudicationUrls.offenceCodeSelection.root,
    offenceCodeDecisionsRoutes({ placeOnReportService, userService, offenceSessionService, decisionTreeService })
  )
  router.use(adjudicationUrls.incidentDetails.root, incidentDetailsRoutes({ placeOnReportService, locationService }))
  if (config.yoiNewPagesFeatureFlag) {
    router.use(adjudicationUrls.incidentRole.root, incidentRoleRoutes({ placeOnReportService }))
  }
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
    prisonerReportRoutes({
      reportedAdjudicationsService,
      locationService,
      userService,
      decisionTreeService,
    })
  )
  router.use(adjudicationUrls.deletePerson.root, deletePersonRoutes({ placeOnReportService, userService }))
  router.use('/', homepageRoutes({ userService }))
  if (config.yoiNewPagesFeatureFlag) {
    router.use(adjudicationUrls.ageOfPrisoner.root, ageOfPrisonerRoutes({ placeOnReportService }))
  }
  return router
}
