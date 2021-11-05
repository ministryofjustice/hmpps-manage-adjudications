import type { Router } from 'express'

import incidentStatementRoutes from './incidentStatement'
import incidentDetailsRoutes from './incidentDetails'
import checkYourAnswersRoutes from './checkYourAnswers'
import confirmedOnReportRoutes from './confirmedOnReport'
import taskListRoutes from './taskList'
import prisonerRoutes from './prisonerRoutes'
import prisonerSearchRoutes from './prisonerSearch'
import prisonerSelectRoutes from './prisonerSelect'
import yourCompletedReportsRoutes from './completedReports'

import { Services } from '../services'

export default function routes(
  router: Router,
  { placeOnReportService, locationService, prisonerSearchService, reportedAdjudicationsService }: Services
): Router {
  router.use('/incident-details', incidentDetailsRoutes({ placeOnReportService, locationService }))
  router.use('/incident-statement', incidentStatementRoutes({ placeOnReportService }))
  router.use('/check-your-answers', checkYourAnswersRoutes({ placeOnReportService }))
  router.use('/place-a-prisoner-on-report', taskListRoutes())
  router.use('/prisoner-placed-on-report', confirmedOnReportRoutes({ reportedAdjudicationsService }))
  router.use('/prisoner', prisonerRoutes({ placeOnReportService }))
  router.use('/search-for-prisoner', prisonerSearchRoutes())
  router.use('/select-prisoner', prisonerSelectRoutes({ prisonerSearchService }))
  router.use('/your-completed-reports', yourCompletedReportsRoutes({ reportedAdjudicationsService }))
  router.get('/', (req, res, next) => res.render('pages/index'))
  return router
}
