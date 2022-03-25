import express from 'express'

import path from 'path'
import createError from 'http-errors'
import config from './config'
import GotenbergClient from './data/gotenbergClient'

import indexRoutes from './routes'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import standardRouter from './routes/standardRouter'

import setUpWebSession from './middleware/setUpWebSession'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import { Services } from './services'
import { pdfRenderer } from './utils/pdfRenderer'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, path)
  app.use(setUpAuthentication())
  app.use(pdfRenderer(new GotenbergClient(config.apis.gotenberg.apiUrl)))
  app.use(authorisationMiddleware())

  app.use('/', indexRoutes(standardRouter(services.userService), services))
  app.get('/back-to-start', async (req, res) => {
    const { journeyStartUrl = '/' } = req.session
    delete req.session.journeyStartUrl

    return res.redirect(journeyStartUrl)
  })

  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(process.env.NODE_ENV === 'production'))

  return app
}
