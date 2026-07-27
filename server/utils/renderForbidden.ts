import { Response } from 'express'

/**
 * Renders the "you may not view people outside your establishment" page with a 403 status. Used both
 * by the error handler (when the prison-permissions guard denies a request) and directly by routes
 * that need to refuse a request after the guard has run (e.g. a charge that belongs to another
 * prisoner). Keeps the deny experience identical wherever it is triggered.
 */
export default function renderForbidden(res: Response, prisonerNumber?: string): void {
  res.status(403).render('pages/forbidden', { prisonerNumber })
}
