import type { Request, Response, NextFunction } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'
import renderForbidden from './utils/renderForbidden'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    // The hmpps-prison-permissions-lib guard rejects with a PrisonerPermissionError (403) carrying
    // deniedPermissionChecks when a user may not see a prisoner. Show the forbidden page rather than
    // signing them out, which is what the generic 403 branch below would otherwise do.
    if (Array.isArray((error as unknown as { deniedPermissionChecks?: unknown[] }).deniedPermissionChecks)) {
      return renderForbidden(res)
    }

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    const title = production ? undefined : error.message
    const status = production ? null : error.status
    const stack = production ? null : error.stack

    res.status(error.status || 500)

    return res.render('pages/error', {
      title,
      status,
      stack,
      url: res.locals?.redirectUrl || req.originalUrl,
    })

    return res.render('pages/error')
  }
}
