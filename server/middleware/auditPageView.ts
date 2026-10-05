import type { AuditService, PageViewEventDetails, SubjectType } from '@ministryofjustice/hmpps-audit-client'
import type { Request, RequestHandler } from 'express'

import logger from '../../logger'
import adjudicationUrls from '../utils/urlGenerator'

/**
 * Requests that are not page views:
 * - the home redirect
 * - prisoner photos, which appear many times on search results
 * - PDFs printed from charge pages: the page they are printed from is audited already
 * - the back-to-start redirect
 * Health checks and static resources are mounted earlier in app.ts so never reach here.
 */
const notPageViews = [
  /^\/(?:\?.*)?$/,
  /^\/prisoner\/[^/]+\/image(?:\?.*)?$/,
  /^\/print\//,
  /^\/back-to-start(?:\?.*)?$/,
]

/** Prisoner numbers appear as a whole path segment, e.g. /adjudication-history/A1234BC */
const prisonerNumberInPath = /\/([A-Z][0-9]{4}[A-Z]{2})(?=\/|\?|$)/

function routeToRegExp(route: string): RegExp {
  const pattern = route
    .replace(/\/$/, '')
    .split('/')
    .map(segment => {
      if (segment === ':chargeNumber') return '(?<chargeNumber>[^/]+)'
      if (segment.startsWith(':')) return '[^/]+'
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('/')
  return new RegExp(`^${pattern}/?$`)
}

/**
 * Most pages are about a single charge rather than a prisoner, so the charge number is recorded in the details.
 * Matched against every route that has a :chargeNumber parameter, so draft ids and other numbers are not mistaken for one.
 */
const chargeNumberRoutes: RegExp[] = Object.values(
  adjudicationUrls as Record<string, { root?: string; matchers?: Record<string, string | (() => string)> }>,
).flatMap(({ root = '', matchers = {} }) =>
  Object.values(matchers)
    .map(matcher => (typeof matcher === 'function' ? matcher() : matcher))
    .filter(matcher => matcher.includes(':chargeNumber'))
    .map(matcher => routeToRegExp(`${root}${matcher}`)),
)

function chargeNumberOfRequest(req: Request): string | undefined {
  return chargeNumberRoutes.map(route => req.path.match(route)?.groups?.chargeNumber).find(Boolean)
}

/** HMPPS Audit rejects subject ids longer than this */
const maxSubjectIdLength = 80

type Subject = { subjectType: SubjectType; subjectId?: string }

type RenderCallback = (err: Error, html: string) => void
type ResRender = (view: string, options?: object, callback?: RenderCallback) => void

/**
 * Audits page views to HMPPS Audit.
 *
 * Emits PAGE_VIEW_ACCESS_ATTEMPT once the response closes – covering redirects, errors and
 * requests refused downstream by the authorisation middleware – and PAGE_VIEW when a page
 * renders successfully.
 *
 * Mount after authentication but before authorisation, so that refused requests are still
 * recorded as attempts.
 */
export default function auditPageView(auditService: AuditService): RequestHandler {
  return (req, res, next) => {
    const who = res.locals.user?.username
    if (!who || notPageViews.some(pattern => pattern.test(req.originalUrl))) {
      next()
      return
    }

    const chargeNumber = chargeNumberOfRequest(req)
    res.locals.auditEvent = {
      who,
      correlationId: req.id,
      details: chargeNumber ? { pageUrl: req.originalUrl, chargeNumber } : { pageUrl: req.originalUrl },
      ...subjectOfRequest(req),
    }

    res.prependOnceListener('close', () => {
      logPageView(auditService, res.locals.auditEvent, true)
    })

    const resRender = res.render as ResRender
    res.render = ((view: string, options?: object | RenderCallback, callback?: RenderCallback) => {
      // callers that handle the html themselves (e.g. the PDF renderer) are not page views
      if (typeof options === 'function' || callback) {
        resRender.call(res, view, options, callback)
        return
      }
      resRender.call(res, view, options, (err: Error, html: string) => {
        if (err) {
          next(err)
          return
        }
        // send the page first: auditing must never delay or break rendering
        res.send(html)
        // forbidden and error pages are not successful page views
        if (res.statusCode < 400) {
          logPageView(auditService, res.locals.auditEvent)
        }
      })
    }) as typeof res.render

    next()
  }
}

function subjectOfRequest(req: Request): Subject {
  const prisonerNumber = req.path.match(prisonerNumberInPath)?.[1]
  if (prisonerNumber) {
    return { subjectType: 'PRISONER_ID', subjectId: prisonerNumber }
  }
  const searchTerm = typeof req.query?.searchTerm === 'string' ? req.query.searchTerm.trim() : undefined
  if (searchTerm) {
    return { subjectType: 'SEARCH_TERM', subjectId: searchTerm.substring(0, maxSubjectIdLength) }
  }
  return { subjectType: 'NOT_APPLICABLE' }
}

function logPageView(
  auditService: AuditService,
  auditEvent: PageViewEventDetails | undefined,
  isAttempt = false,
): void {
  if (!auditEvent) return
  // auditing must not be able to break page rendering, so never throw
  auditService
    .logAuditEvent(
      { ...auditEvent, what: isAttempt ? 'PAGE_VIEW_ACCESS_ATTEMPT' : 'PAGE_VIEW' },
      { throwOnError: false, logOnError: true },
    )
    .catch(error => {
      logger.error(error, 'Failed to audit page view')
    })
}
