import type { RequestHandler } from 'express'
import type UserService from '../services/userService'
import { hasAnyRole } from '../utils/utils'
import adjudicationUrls from '../utils/urlGenerator'

// Pages for reviewers only. Checked on every request, so a form posted by someone without the role changes nothing.
export default function reviewerOnly(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    const userRoles = await userService.getUserRoles(res.locals.user.token)
    if (hasAnyRole(['ADJUDICATIONS_REVIEWER'], userRoles)) {
      return next()
    }
    return res.render('pages/notFound.njk', { url: req.headers.referer || adjudicationUrls.homepage.root })
  }
}
