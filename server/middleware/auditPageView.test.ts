import express from 'express'
import request from 'supertest'

import { AuditService } from '@ministryofjustice/hmpps-audit-client'

import auditPageView from './auditPageView'

jest.mock('@ministryofjustice/hmpps-audit-client')

let auditService: jest.Mocked<AuditService>

const renderedHtml = '<html lang="en">page</html>'

/**
 * Minimal app mirroring app.ts’ ordering: user first, then the audit middleware, then routes.
 *
 * `res.render` is stubbed *before* the audit middleware so that the middleware wraps the stub,
 * exactly as it wraps the real nunjucks renderer in the running app.
 */
function appWithAuditing({
  user = { username: 'user1' } as Express.User,
  renderFails = false,
}: { user?: Express.User | null; renderFails?: boolean } = {}): express.Express {
  const app = express()

  app.use((req, res, next) => {
    req.id = 'request123'
    res.locals.user = user ?? undefined
    res.render = ((_view: string, options?: unknown, callback?: (err: Error, html: string) => void) => {
      const done = typeof options === 'function' ? options : callback
      const error = renderFails ? new Error('render failed') : null
      if (done) {
        done(error, renderedHtml)
      } else if (error) {
        next(error)
      } else {
        res.send(renderedHtml)
      }
    }) as typeof res.render
    next()
  })

  app.get('*any', auditPageView(auditService))

  app.get('/', (req, res) => res.redirect('/place-a-prisoner-on-report'))
  app.get('/back-to-start', (req, res) => res.redirect('/'))
  app.get('/prisoner/:prisonerNumber/image', (req, res) => res.send('image'))
  app.get('/adjudication-history/:prisonerNumber', (req, res) => res.render('pages/adjudicationHistory'))
  app.get('/prisoner-report-consolidated/:prisonerNumber/report/:chargeNumber', (req, res) =>
    res.render('pages/prisonerReport'),
  )
  app.get('/hearing-details/:chargeNumber/review', (req, res) => res.render('pages/hearingDetails'))
  app.get('/incident-role/:draftId', (req, res) => res.render('pages/incidentRole'))
  app.get('/select-prisoner', (req, res) => res.render('pages/selectPrisoner'))
  app.get('/forbidden/:prisonerNumber', (req, res) => res.status(403).render('pages/forbidden'))
  app.get('/print/:chargeNumber/dis12/pdf', (req, res) => res.send('pdf'))
  app.get('/rendered-for-pdf/:chargeNumber', (req, res) => {
    // as the PDF renderer does: render to a string, then send something else
    res.render('pages/pdfHeader', {}, (err: Error, html: string) => res.send(`pdf of ${html}`))
  })

  app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).send('error')
  })

  return app
}

/** audit events logged, in the order the audit service saw them */
function loggedEvents() {
  return auditService.logAuditEvent.mock.calls.map(([event]) => ({
    subject: { subjectType: event.subjectType, subjectId: event.subjectId },
    what: event.what,
  }))
}

const forPrisoner = { subjectType: 'PRISONER_ID', subjectId: 'A1234BC' }

beforeEach(() => {
  auditService = new AuditService(null) as jest.Mocked<AuditService>
  auditService.logAuditEvent.mockResolvedValue(undefined)
})

describe('auditPageView', () => {
  it('logs a page view and an access attempt when a page renders', async () => {
    await request(appWithAuditing()).get('/adjudication-history/A1234BC').expect(200).expect(renderedHtml)

    expect(loggedEvents()).toEqual([
      { subject: forPrisoner, what: 'PAGE_VIEW' },
      { subject: forPrisoner, what: 'PAGE_VIEW_ACCESS_ATTEMPT' },
    ])
  })

  it('passes the username, correlation id and page url to the audit service', async () => {
    await request(appWithAuditing()).get('/adjudication-history/A1234BC?page=2').expect(200)

    expect(auditService.logAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        who: 'user1',
        correlationId: 'request123',
        details: { pageUrl: '/adjudication-history/A1234BC?page=2' },
      }),
      { throwOnError: false, logOnError: true },
    )
  })

  it('finds a prisoner number anywhere in the path and records the charge number too', async () => {
    await request(appWithAuditing()).get('/prisoner-report-consolidated/A1234BC/report/1524493').expect(200)

    expect(loggedEvents()[0].subject).toEqual(forPrisoner)
    expect(auditService.logAuditEvent.mock.calls[0][0].details).toEqual({
      pageUrl: '/prisoner-report-consolidated/A1234BC/report/1524493',
      chargeNumber: '1524493',
    })
  })

  it('records the charge number for a page about a charge rather than a prisoner', async () => {
    await request(appWithAuditing()).get('/hearing-details/1524493/review').expect(200)

    expect(loggedEvents()[0].subject).toEqual({ subjectType: 'NOT_APPLICABLE', subjectId: undefined })
    expect(auditService.logAuditEvent.mock.calls[0][0].details).toEqual({
      pageUrl: '/hearing-details/1524493/review',
      chargeNumber: '1524493',
    })
  })

  it('does not mistake a draft id for a charge number', async () => {
    await request(appWithAuditing()).get('/incident-role/123').expect(200)

    expect(auditService.logAuditEvent.mock.calls[0][0].details).toEqual({ pageUrl: '/incident-role/123' })
  })

  it('picks up the search term from the query string', async () => {
    await request(appWithAuditing()).get('/select-prisoner?searchTerm=Smith').expect(200)

    expect(loggedEvents()[0].subject).toEqual({ subjectType: 'SEARCH_TERM', subjectId: 'Smith' })
  })

  it('truncates long search terms', async () => {
    await request(appWithAuditing())
      .get(`/select-prisoner?searchTerm=${'a'.repeat(100)}`)
      .expect(200)

    expect(loggedEvents()[0].subject).toEqual({ subjectType: 'SEARCH_TERM', subjectId: 'a'.repeat(80) })
  })

  it('logs only an attempt when a request does not render a page', async () => {
    await request(appWithAuditing()).get('/adjudication-history/A1234BC/missing').expect(404)

    expect(loggedEvents()).toEqual([{ subject: forPrisoner, what: 'PAGE_VIEW_ACCESS_ATTEMPT' }])
  })

  it('logs only an attempt when the forbidden page is shown', async () => {
    await request(appWithAuditing()).get('/forbidden/A1234BC').expect(403)

    expect(loggedEvents()).toEqual([{ subject: forPrisoner, what: 'PAGE_VIEW_ACCESS_ATTEMPT' }])
  })

  it('passes a caller’s own render callback straight through without logging a page view', async () => {
    await request(appWithAuditing()).get('/rendered-for-pdf/1524493').expect(200).expect(`pdf of ${renderedHtml}`)

    expect(loggedEvents().map(({ what }) => what)).toEqual(['PAGE_VIEW_ACCESS_ATTEMPT'])
  })

  it.each([
    ['the home redirect', '/'],
    ['the back-to-start redirect', '/back-to-start'],
    ['a prisoner photo', '/prisoner/A1234BC/image'],
    ['a printed PDF', '/print/1524493/dis12/pdf'],
  ])('does not audit %s', async (_name, url) => {
    await request(appWithAuditing()).get(url)

    expect(auditService.logAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit when there is no signed-in user', async () => {
    await request(appWithAuditing({ user: null }))
      .get('/adjudication-history/A1234BC')
      .expect(200)

    expect(auditService.logAuditEvent).not.toHaveBeenCalled()
  })

  it('still serves the page when auditing fails', async () => {
    auditService.logAuditEvent.mockRejectedValue(new Error('SQS is down'))

    await request(appWithAuditing()).get('/adjudication-history/A1234BC').expect(200).expect(renderedHtml)
  })

  it('passes render errors to the error handler and logs only an attempt', async () => {
    await request(appWithAuditing({ renderFails: true }))
      .get('/adjudication-history/A1234BC')
      .expect(500)

    expect(loggedEvents()).toEqual([{ subject: forPrisoner, what: 'PAGE_VIEW_ACCESS_ATTEMPT' }])
  })
})
