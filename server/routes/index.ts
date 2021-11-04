import type { Router } from 'express'

import incidentStatementRoutes from './incidentStatement'
import incidentDetailsRoutes from './incidentDetails'
import checkYourAnswersRoutes from './checkYourAnswers'
import taskListRoutes from './taskList'
import prisonerRoutes from './prisonerRoutes'
import prisonerSearchRoutes from './prisonerSearch'
import prisonerSelectRoutes from './prisonerSelect'
import homepageRoutes from './homepage'

import { Services } from '../services'

export default function routes(
  router: Router,
  { placeOnReportService, locationService, prisonerSearchService }: Services
): Router {
  router.use('/incident-details', incidentDetailsRoutes({ placeOnReportService, locationService }))
  router.use('/incident-statement', incidentStatementRoutes({ placeOnReportService }))
  router.use('/check-your-answers', checkYourAnswersRoutes({ placeOnReportService }))
  router.use('/place-a-prisoner-on-report', taskListRoutes())
  router.use('/prisoner', prisonerRoutes({ placeOnReportService }))
  router.use('/search-for-prisoner', prisonerSearchRoutes())
  router.use('/select-prisoner', prisonerSelectRoutes({ prisonerSearchService }))
  router.use('/', homepageRoutes())
  return router
}
