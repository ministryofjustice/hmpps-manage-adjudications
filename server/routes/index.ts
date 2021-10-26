import type { Router } from 'express'

import incidentStatementRoutes from './incidentStatement'
import checkYourAnswersRoutes from './checkYourAnswers'
import placeOnReportRoutes from './placeOnReport'
import prisonerRoutes from './prisonerRoutes'

import { Services } from '../services'

export default function routes(router: Router, { placeOnReportService }: Services): Router {
  router.use('/incident-statement', incidentStatementRoutes({ placeOnReportService }))
  router.use('/check-your-answers', checkYourAnswersRoutes())
  router.use('/place-a-prisoner-on-report', placeOnReportRoutes())
  router.use('/prisoner', prisonerRoutes({ placeOnReportService }))
  router.get('/', (req, res, next) => res.render('pages/index'))
  return router
}
