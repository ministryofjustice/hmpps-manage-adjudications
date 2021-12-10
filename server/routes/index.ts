import type { Router } from 'express'

import incidentStatementRoutes from './incidentStatement'
import incidentDetailsRoutes from './incidentDetails'
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

import { Services } from '../services'

export default function routes(
  router: Router,
  { placeOnReportService, locationService, prisonerSearchService, reportedAdjudicationsService, userService }: Services
): Router {
  router.use('/incident-details', incidentDetailsRoutes({ placeOnReportService, locationService }))
  router.use('/incident-statement', incidentStatementRoutes({ placeOnReportService }))
  router.use('/check-your-answers', checkYourAnswersRoutes({ placeOnReportService, locationService }))
  router.use('/prisoner-placed-on-report', confirmedOnReportRoutes({ reportedAdjudicationsService }))
  router.use('/place-the-prisoner-on-report', taskListRoutes({ placeOnReportService }))
  router.use('/prisoner', prisonerRoutes({ placeOnReportService }))
  router.use('/search-for-prisoner', prisonerSearchRoutes())
  router.use('/select-prisoner', prisonerSelectRoutes({ prisonerSearchService }))
  router.use('/your-completed-reports', yourCompletedReportsRoutes({ reportedAdjudicationsService }))
  router.use('/all-completed-reports', allCompletedReportsRoutes({ reportedAdjudicationsService, userService }))
  router.use('/select-report', continueReportSelectRoutes({ placeOnReportService }))
  router.use(
    '/prisoner-report',
    prisonerReportRoutes({ reportedAdjudicationsService, placeOnReportService, locationService, userService })
  )
  router.use('/', homepageRoutes({ userService }))
  return router
}
