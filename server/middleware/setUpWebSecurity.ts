import crypto from 'crypto'
import express, { Router, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use((_req: Request, res: Response, next: NextFunction) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })

  // This nonce allows us to use scripts with the use of the `cspNonce` local, e.g (in a Nunjucks template):
  // <script nonce="{{ cspNonce }}">
  // or
  // <link href="http://example.com/" rel="stylesheet" nonce="{{ cspNonce }}">
  // This ensures only scripts we trust are loaded, and not anything injected into the
  // page by an attacker.
  const scriptSrc = [
    "'self'",
    (req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
    'code.jquery.com',
    '*.googletagmanager.com',
    'www.google-analytics.com',
    // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
    "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
  ]
  const styleSrc = [
    "'self'",
    'code.jquery.com',
    "'unsafe-inline'",
    (req: Request, res: Response) => `'nonce-${res.locals.cspNonce}'`,
  ]
  const fontSrc = ["'self'"]
  const imgSrc = ["'self'", '*.googletagmanager.com', '*.google-analytics.com', 'code.jquery.com', 'data:']
  const formAction = [`'self' ${config.digitalPrisonServiceUrl}`]
  
  if (config.apis.frontendComponents.url) {
    scriptSrc.push(config.apis.frontendComponents.url)
    styleSrc.push(config.apis.frontendComponents.url)
    imgSrc.push(config.apis.frontendComponents.url)
    fontSrc.push(config.apis.frontendComponents.url)
  }

  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", '*.googletagmanager.com', '*.google-analytics.com', '*.analytics.google.com'],
          scriptSrc,
          styleSrc,
          fontSrc,
          imgSrc,
          formAction
        },
      },
      // When we updated Helmet past v6, these policies were set to true as default,
      // but crossOriginEmbedderPolicy: true breaks the styling on our datepickers,
      // and crossOriginResourcePolicy: true prevents the stylesheet loading for the PDFs.
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  )
  return router
}
