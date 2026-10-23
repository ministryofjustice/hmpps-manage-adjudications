import { RequestHandler } from 'express'
import adjudicationUrls from '../utils/urlGenerator'

// Pages that only exist in the award-several-punishments journey (IR-1904). The switch follows the user's
// active caseload, so it is checked on every request: a bookmarked page must not open where it is switched off.
export default function multiPrivilegePunishmentsOnly(): RequestHandler {
  return (req, res, next) => {
    if (res.locals.featureToggles?.multiPrivilegePunishments) return next()
    return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
  }
}
